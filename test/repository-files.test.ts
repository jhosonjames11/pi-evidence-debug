import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
	readFileSync(resolve(repositoryRoot, "package.json"), "utf8"),
) as { scripts: Record<string, string> };

describe("repository release files", () => {
	it("defines the checked-in CI workflow and release checks", () => {
		expect(existsSync(resolve(repositoryRoot, ".github/workflows/ci.yml"))).toBe(true);
		expect(packageJson.scripts.check).toBe(
		"npm run test && npm run typecheck && npm run check:secrets",
	);
		expect(packageJson.scripts["check:secrets"]).toBe(
		"node scripts/check-secrets.mjs",
	);
	});
});
