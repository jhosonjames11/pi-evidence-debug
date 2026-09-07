import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { isDangerousCommand, isLikelyVerificationCommand, isPathInsideRoot } from "../src/safety.ts";

describe("isPathInsideRoot", () => {
	it("rejects a path that escapes the project root", () => {
		const root = mkdtempSync(join(tmpdir(), "pi-evidence-debug-root-"));

		try {
			expect(isPathInsideRoot(root, "../secret.txt")).toBe(false);
			expect(isPathInsideRoot(root, "src/app.ts")).toBe(true);
		} finally {
			rmSync(root, { force: true, recursive: true });
		}
	});

	it("rejects a path that exits through a project-local symlink", () => {
		const root = mkdtempSync(join(tmpdir(), "pi-evidence-debug-root-"));
		const outside = mkdtempSync(join(tmpdir(), "pi-evidence-debug-outside-"));

		try {
			symlinkSync(outside, join(root, "outside-link"));
			expect(isPathInsideRoot(root, "outside-link/secret.txt")).toBe(false);
		} finally {
			rmSync(root, { force: true, recursive: true });
			rmSync(outside, { force: true, recursive: true });
		}
	});
});

describe("isDangerousCommand", () => {
	it("blocks destructive commands but allows a focused test", () => {
		expect(isDangerousCommand("rm -rf build")).toBe(true);
		expect(isDangerousCommand("git reset --hard HEAD")).toBe(true);
		expect(isDangerousCommand("git checkout -- pagination.py")).toBe(true);
		expect(isDangerousCommand("python -m unittest -v")).toBe(false);
	});
});

describe("isLikelyVerificationCommand", () => {
	it("recognizes a test command without mistaking repository search for verification", () => {
		expect(isLikelyVerificationCommand("python -m unittest -v")).toBe(true);
		expect(isLikelyVerificationCommand("rg page_summary")).toBe(false);
	});
});
