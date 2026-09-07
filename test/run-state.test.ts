import { expect, it } from "vitest";
import { advanceDebugRun, recordVerificationFailure, startDebugRun } from "../src/run-state.ts";

it("records blocked verification without mutating the original run", () => {
	const initial = startDebugRun("repair parser");
	const blocked = advanceDebugRun(initial, "blocked", "outside project root");

	expect(initial.phase).toBe("investigating");
	expect(blocked).toMatchObject({ task: "repair parser", phase: "blocked", blockedReason: "outside project root" });
	expect(blocked.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});

it("clears a blocked reason when a later phase is not blocked", () => {
	const blocked = advanceDebugRun(startDebugRun("repair parser"), "blocked", "outside project root");
	const resumed = advanceDebugRun(blocked, "investigating");

	expect(resumed.blockedReason).toBeUndefined();
});

it("records that a failing verification reproduced a defect", () => {
	const initial = startDebugRun("repair parser");
	const reproduced = recordVerificationFailure(initial);

	expect(initial.evidence).toBe("none");
	expect(reproduced).toMatchObject({ evidence: "verification-failed", phase: "investigating" });
	expect(reproduced.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});
