import { describe, expect, it } from "vitest";
import type {
	ExtensionAPI,
	ExtensionCommandContext,
	RegisteredCommand,
} from "@earendil-works/pi-coding-agent";
import { createDebugExtension } from "../index.ts";

describe("createDebugExtension", () => {
	it("sends the evidence-based debugging prompt from /debug", async () => {
		const commands = new Map<string, Omit<RegisteredCommand, "name" | "sourceInfo">>();
		const sentMessages: string[] = [];
		const api = {
			appendEntry() {},
			on() {},
			registerCommand(name: string, command: Omit<RegisteredCommand, "name" | "sourceInfo">) {
				commands.set(name, command);
			},
			sendUserMessage(content: string) {
				sentMessages.push(content);
			},
		} as unknown as ExtensionAPI;
		const commandContext = {
			cwd: "/work/project",
			isIdle: () => true,
			ui: { setStatus() {} },
		} as unknown as ExtensionCommandContext;

		createDebugExtension(api);
		await commands.get("debug")?.handler("repair the final page", commandContext);

		expect(sentMessages).toHaveLength(1);
		expect(sentMessages[0]).toContain("repair the final page");
		expect(sentMessages[0]).toContain("## Root cause");
	});

	it("records a failing test command as reproduction evidence", async () => {
		const commands = new Map<string, Omit<RegisteredCommand, "name" | "sourceInfo">>();
		const handlers = new Map<string, Array<(event: unknown, ctx: unknown) => Promise<unknown>>>();
		const entries: unknown[] = [];
		const api = {
			appendEntry(_type: string, entry: unknown) {
				entries.push(entry);
			},
			on(eventName: string, handler: (event: unknown, ctx: unknown) => Promise<unknown>) {
				const eventHandlers = handlers.get(eventName) ?? [];
				eventHandlers.push(handler);
				handlers.set(eventName, eventHandlers);
			},
			registerCommand(name: string, command: Omit<RegisteredCommand, "name" | "sourceInfo">) {
				commands.set(name, command);
			},
			sendUserMessage() {},
		} as unknown as ExtensionAPI;
		const commandContext = {
			cwd: "/work/project",
			isIdle: () => true,
			ui: { setStatus() {} },
		} as unknown as ExtensionCommandContext;

		createDebugExtension(api);
		await commands.get("debug")?.handler("repair the final page", commandContext);

		const handler = handlers.get("tool_result")?.[0];
		expect(handler).toBeTypeOf("function");
		if (!handler) return;

		await handler(
			{
				type: "tool_result",
				toolName: "bash",
				toolCallId: "test-1",
				input: { command: "python3 -m unittest -v" },
				content: [],
				isError: true,
				details: undefined,
			},
			commandContext,
		);

		expect(entries.at(-1)).toMatchObject({ evidence: "verification-failed" });
	});

	it("does not record a passing test command as reproduction evidence", async () => {
		const commands = new Map<string, Omit<RegisteredCommand, "name" | "sourceInfo">>();
		const handlers = new Map<string, Array<(event: unknown, ctx: unknown) => Promise<unknown>>>();
		const entries: unknown[] = [];
		const api = {
			appendEntry(_type: string, entry: unknown) {
				entries.push(entry);
			},
			on(eventName: string, handler: (event: unknown, ctx: unknown) => Promise<unknown>) {
				const eventHandlers = handlers.get(eventName) ?? [];
				eventHandlers.push(handler);
				handlers.set(eventName, eventHandlers);
			},
			registerCommand(name: string, command: Omit<RegisteredCommand, "name" | "sourceInfo">) {
				commands.set(name, command);
			},
			sendUserMessage() {},
		} as unknown as ExtensionAPI;
		const commandContext = {
			cwd: "/work/project",
			isIdle: () => true,
			ui: { setStatus() {} },
		} as unknown as ExtensionCommandContext;

		createDebugExtension(api);
		await commands.get("debug")?.handler("repair the final page", commandContext);

		const handler = handlers.get("tool_result")?.[0];
		expect(handler).toBeTypeOf("function");
		if (!handler) return;

		await handler(
			{
				type: "tool_result",
				toolName: "bash",
				toolCallId: "test-1",
				input: { command: "python3 -m unittest -v" },
				content: [],
				isError: false,
				details: undefined,
			},
			commandContext,
		);

		expect(entries).toHaveLength(1);
		expect(entries[0]).toMatchObject({ evidence: "none" });
	});
});
