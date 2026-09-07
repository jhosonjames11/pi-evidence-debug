import { describe, expect, it } from "vitest";
import { buildDebugPrompt } from "../src/debug-prompt.ts";

describe("buildDebugPrompt", () => {
	it("requires a no-test reproduction and evidence-based final report", () => {
		const prompt = buildDebugPrompt("incorrect total for a final page");

		expect(prompt).toContain("If no test runner is available");
		expect(prompt).toContain("smallest reproducible invocation");
		expect(prompt).toContain("## Root cause");
		expect(prompt).toContain("## Verification");
		expect(prompt).toContain("incorrect total for a final page");
	});

	it("forbids speculative edits when no defect has been reproduced", () => {
		const prompt = buildDebugPrompt("inspect the repository");

		expect(prompt).toContain("Do not edit code unless you have reproduced a failure");
		expect(prompt).toContain("do not modify source files");
		expect(prompt).toContain("Do not invent requirements from possible hidden tests");
	});
});
