export function buildDebugPrompt(task: string): string {
	const goal = task.trim() || "Find and fix the most likely incorrect behavior in this repository.";

	return `You are running a disciplined debugging task.

Task: ${goal}

1. Inspect the repository and any existing changes before editing.
2. Discover and run the narrowest relevant test, build, or executable command before editing.
3. Do not edit code unless you have reproduced a failure, observed incorrect runtime output, or found a contradiction with an explicit requirement.
4. If no test runner is available, inspect an executable entry point and create the smallest reproducible invocation; run it before and after the fix.
5. If relevant verification passes and you have no other direct evidence of a defect, do not modify source files. Report that no confirmed defect was found and list potential risks only in Remaining risk.
6. Do not invent requirements from possible hidden tests, invalid inputs, or unspecified edge cases. Do not add validation or change an API contract without an explicit requirement.
7. State a root-cause hypothesis backed by source and execution evidence.
8. Make the smallest fix that addresses that cause, then rerun the same verification.
9. Do not claim success without command output. If you add a behavior required by an explicit specification, first add a regression test that fails before the change.

Finish with exactly these sections:
## Root cause
## Changes
## Verification
## Remaining risk`;
}
