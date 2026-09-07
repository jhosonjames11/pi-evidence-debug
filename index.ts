import type { ExtensionAPI, ExtensionContext, ToolCallEvent, ToolResultEvent } from "@earendil-works/pi-coding-agent";
import { buildDebugPrompt } from "./src/debug-prompt.ts";
import {
	advanceDebugRun,
	recordVerificationFailure,
	type DebugPhase,
	type DebugRun,
	startDebugRun,
} from "./src/run-state.ts";
import { isDangerousCommand, isLikelyVerificationCommand, isPathInsideRoot } from "./src/safety.ts";

const RUN_ENTRY_TYPE = "debug-run";
const STATUS_KEY = "debug-agent";
type BashToolResultEvent = ToolResultEvent & { toolName: "bash" };

function isToolCallEventType<TName extends ToolCallEvent["toolName"]>(
	toolName: TName,
	event: ToolCallEvent,
): event is Extract<ToolCallEvent, { toolName: TName }> {
	return event.toolName === toolName;
}

function isBashToolResult(event: ToolResultEvent): event is BashToolResultEvent {
	return event.toolName === "bash";
}

function describeRun(run: DebugRun): string {
	const evidenceSuffix = run.evidence === "verification-failed" ? " (failure reproduced)" : "";

	switch (run.phase) {
		case "investigating":
			return `Debug agent: investigating${evidenceSuffix}`;
		case "fixing":
			return `Debug agent: applying fix${evidenceSuffix}`;
		case "verifying":
			return `Debug agent: verifying${evidenceSuffix}`;
		case "finished":
			return `Debug agent: finished${evidenceSuffix} (check final report)`;
		case "blocked":
			return `Debug agent: blocked${evidenceSuffix}`;
	}
}

export function createDebugExtension(pi: ExtensionAPI): void {
	let currentRun: DebugRun | undefined;

	function recordRun(ctx: ExtensionContext, phase: DebugPhase, blockedReason?: string): void {
		if (!currentRun) return;

		currentRun = advanceDebugRun(currentRun, phase, blockedReason);
		pi.appendEntry(RUN_ENTRY_TYPE, currentRun);
		ctx.ui.setStatus(STATUS_KEY, describeRun(currentRun));
	}

	function recordObservedVerificationFailure(ctx: ExtensionContext): void {
		if (!currentRun || currentRun.evidence === "verification-failed") return;

		currentRun = recordVerificationFailure(currentRun);
		pi.appendEntry(RUN_ENTRY_TYPE, currentRun);
		ctx.ui.setStatus(STATUS_KEY, describeRun(currentRun));
	}

	function block(ctx: ExtensionContext, reason: string): { block: true; reason: string } {
		recordRun(ctx, "blocked", reason);
		if (ctx.hasUI) ctx.ui.notify(reason, "warning");
		return { block: true, reason };
	}

	pi.registerCommand("debug", {
		description: "Investigate, fix, and verify a repository bug",
		handler: async (args, ctx) => {
			const task = args.trim() || "Find and fix the most likely incorrect behavior in this repository.";
			currentRun = startDebugRun(task);
			pi.appendEntry(RUN_ENTRY_TYPE, currentRun);
			ctx.ui.setStatus(STATUS_KEY, describeRun(currentRun));

			const delivery = ctx.isIdle() ? undefined : { deliverAs: "followUp" as const };
			pi.sendUserMessage(buildDebugPrompt(task), delivery);
		},
	});

	pi.on("tool_call", async (event, ctx) => {
		if (isToolCallEventType("write", event) || isToolCallEventType("edit", event)) {
			if (!isPathInsideRoot(ctx.cwd, event.input.path)) {
				return block(ctx, `Blocked mutation outside project root: ${event.input.path}`);
			}
			recordRun(ctx, "fixing");
			return undefined;
		}

		if (!isToolCallEventType("bash", event)) return undefined;

		if (isDangerousCommand(event.input.command)) {
			if (!ctx.hasUI) return block(ctx, "Dangerous command blocked because this session has no confirmation UI.");

			const allowed = await ctx.ui.confirm("Dangerous command", `Allow this command?\n\n${event.input.command}`);
			if (!allowed) return block(ctx, "Dangerous command blocked by user.");
		}

		if (isLikelyVerificationCommand(event.input.command)) recordRun(ctx, "verifying");
		return undefined;
	});

	pi.on("tool_result", async (event, ctx) => {
		if (!isBashToolResult(event) || !event.isError) return undefined;

		const command = event.input.command;
		if (typeof command === "string" && isLikelyVerificationCommand(command)) {
			recordObservedVerificationFailure(ctx);
		}
		return undefined;
	});

	pi.on("agent_settled", async (_event, ctx) => {
		if (!currentRun) return;
		if (currentRun.phase !== "blocked") recordRun(ctx, "finished");
		ctx.ui.setStatus(STATUS_KEY, undefined);
	});
}

export default createDebugExtension;
