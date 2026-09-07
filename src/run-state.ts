export type DebugPhase = "investigating" | "fixing" | "verifying" | "finished" | "blocked";
export type DebugEvidence = "none" | "verification-failed";

export interface DebugRun {
	task: string;
	phase: DebugPhase;
	evidence: DebugEvidence;
	startedAt: string;
	updatedAt: string;
	blockedReason?: string;
}

export function startDebugRun(task: string): DebugRun {
	const timestamp = new Date().toISOString();

	return {
		task,
		phase: "investigating",
		evidence: "none",
		startedAt: timestamp,
		updatedAt: timestamp,
	};
}

export function recordVerificationFailure(run: DebugRun): DebugRun {
	return {
		...run,
		evidence: "verification-failed",
		updatedAt: new Date().toISOString(),
	};
}

export function advanceDebugRun(run: DebugRun, phase: DebugPhase, blockedReason?: string): DebugRun {
	const { blockedReason: _previousBlockedReason, ...unblockedRun } = run;

	return {
		...unblockedRun,
		phase,
		updatedAt: new Date().toISOString(),
		...(phase === "blocked" && blockedReason ? { blockedReason } : {}),
	};
}
