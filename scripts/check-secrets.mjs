import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "__pycache__", "coverage", "node_modules"]);
const checks = [
	{ label: "secret-like token", pattern: /\b(?:sk|rk|pk)_[A-Za-z0-9_-]{16,}\b/ },
	{ label: "personal macOS home path", pattern: /\/Users\/[^/\s]+/ },
	{ label: "Azure Cognitive Services endpoint", pattern: /https?:\/\/[^\s"'`]+\.cognitiveservices\.azure\.com/i },
	{ label: "Azure OpenAI environment variable", pattern: /\bAZURE_OPENAI(?:_[A-Z_]+)?\b/ },
];

async function collectFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			if (!ignoredDirectories.has(entry.name)) files.push(...(await collectFiles(path)));
			continue;
		}
		if (entry.isFile()) files.push(path);
	}

	return files;
}

const findings = [];
for (const file of await collectFiles(root)) {
	const content = await readFile(file, "utf8");
	for (const check of checks) {
		if (check.pattern.test(content)) findings.push({ file: relative(root, file), label: check.label });
	}
}

if (findings.length > 0) {
	for (const finding of findings) console.error(`${finding.file}: ${finding.label}`);
	process.exitCode = 1;
} else {
	console.log("No prohibited secret or personal-environment patterns found.");
}
