import { realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

function isResolvedPathInsideRoot(root: string, candidate: string): boolean {
	const pathFromRoot = relative(root, candidate);
	return pathFromRoot !== ".." && !pathFromRoot.startsWith(`..${sep}`) && !isAbsolute(pathFromRoot);
}

function resolveExistingAncestor(candidate: string): { logicalPath: string; realPath: string } | undefined {
	let logicalPath = candidate;

	while (true) {
		try {
			return { logicalPath, realPath: realpathSync.native(logicalPath) };
		} catch {
			const parent = dirname(logicalPath);
			if (parent === logicalPath) return undefined;
			logicalPath = parent;
		}
	}
}

export function isPathInsideRoot(root: string, candidate: string): boolean {
	const resolvedRoot = resolve(root);
	const resolvedCandidate = isAbsolute(candidate) ? resolve(candidate) : resolve(resolvedRoot, candidate);
	if (!isResolvedPathInsideRoot(resolvedRoot, resolvedCandidate)) return false;

	try {
		const realRoot = realpathSync.native(resolvedRoot);
		const ancestor = resolveExistingAncestor(resolvedCandidate);
		if (!ancestor) return false;

		const unresolvedTail = relative(ancestor.logicalPath, resolvedCandidate);
		const realCandidate = resolve(ancestor.realPath, unresolvedTail);

		return isResolvedPathInsideRoot(realRoot, realCandidate);
	} catch {
		return false;
	}
}

export function isDangerousCommand(command: string): boolean {
	return (
		/\brm\b[^;&|]*(?:--recursive\b|-[a-z]*r[a-z]*)/i.test(command) ||
		/\bsudo\b/i.test(command) ||
		/\bgit\s+reset\s+--hard\b/i.test(command) ||
		/\bgit\s+clean\b[^;&|]*(?:--force\b|-[a-z]*f[a-z]*)/i.test(command) ||
		/\bgit\s+checkout\s+--(?:\s|$)/i.test(command) ||
		/\b(?:chmod|chown)\b[^;&|]*\b777\b/i.test(command) ||
		/\bmkfs\b/i.test(command)
	);
}

export function isLikelyVerificationCommand(command: string): boolean {
	return /(?:^|(?:&&|\|\||;)\s*|\s)(?:python(?:3)?\s+-m\s+unittest|pytest\b|go\s+test\b|cargo\s+test\b|(?:npm|pnpm|yarn)\s+(?:run\s+)?test\b|vitest\b|jest\b|mvn\s+test\b|(?:\.\/)?gradlew\s+test\b)/i.test(
		command,
	);
}
