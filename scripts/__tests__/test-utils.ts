import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Returns a unique scratch directory for a test suite, located under the OS
 * temp dir — never inside the repo worktree.
 *
 * Fixtures MUST live here. Writing them into the tree (the old
 * `join(import.meta.dirname, "../..", ".test-X")` pattern) makes the worktree
 * of whoever runs `pre-push` dirty while tests run, and — for suites that
 * `git init`/`git clone` inside their fixtures — leaves embedded git repos that
 * break `git status --porcelain=2` submodule traversal. That is what made the
 * `scripts/__tests__` failure count non-deterministic (10, 3 or 0 on the same
 * day) depending on when `git status` happened to run against the polluted tree.
 *
 * The `process.pid` suffix keeps concurrent runs (multiple worktrees / sessions
 * on the same machine) from colliding on the same path, while staying stable for
 * the lifetime of a single test process.
 */
export function testDir(name: string): string {
  return join(tmpdir(), `embark-test-${name}-${process.pid}`);
}
