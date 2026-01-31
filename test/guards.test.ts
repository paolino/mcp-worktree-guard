import { describe, it } from "node:test";
import assert from "node:assert";
import { checkMainWorktree } from "../src/guards/main-worktree.js";
import { runGuards } from "../src/guards/index.js";
import type { GuardContext } from "../src/types.js";

describe("checkMainWorktree", () => {
    it("blocks main worktree", () => {
        const context: GuardContext = {
            path: "/code/my-project/src/file.ts",
            worktreeType: "main",
            branch: "main",
            mainWorktreePath: "/code/my-project"
        };

        const result = checkMainWorktree(context);

        assert.strictEqual(result.passed, false);
        assert.strictEqual(result.name, "main-worktree");
        assert.ok(result.message.includes("main worktree"));
        assert.ok(result.details?.suggestion);
    });

    it("allows branch worktree", () => {
        const context: GuardContext = {
            path: "/code/my-project-issue-42/src/file.ts",
            worktreeType: "branch",
            branch: "fix/some-bug",
            mainWorktreePath: "/code/my-project"
        };

        const result = checkMainWorktree(context);

        assert.strictEqual(result.passed, true);
        assert.strictEqual(result.name, "main-worktree");
    });

    it("allows non-repo paths", () => {
        const context: GuardContext = {
            path: "/tmp/some-file.txt",
            worktreeType: "not-a-repo"
        };

        const result = checkMainWorktree(context);

        assert.strictEqual(result.passed, true);
    });
});

describe("runGuards", () => {
    it("reports allPassed false when main worktree", () => {
        const context: GuardContext = {
            path: "/code/my-project/src/file.ts",
            worktreeType: "main",
            mainWorktreePath: "/code/my-project"
        };

        const report = runGuards(context);

        assert.strictEqual(report.allPassed, false);
        assert.strictEqual(report.guards.length, 1);
    });

    it("reports allPassed true when branch worktree", () => {
        const context: GuardContext = {
            path: "/code/my-project-issue-42/src/file.ts",
            worktreeType: "branch",
            mainWorktreePath: "/code/my-project"
        };

        const report = runGuards(context);

        assert.strictEqual(report.allPassed, true);
    });
});
