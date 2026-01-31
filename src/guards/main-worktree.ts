import type { GuardContext, GuardResult } from "../types.js";
import { basename, dirname } from "node:path";

/**
 * Guard that blocks file modifications in the main worktree.
 */
export function checkMainWorktree(context: GuardContext): GuardResult {
    const { worktreeType, path, mainWorktreePath } = context;

    // Not a repo - allow operation
    if (worktreeType === "not-a-repo") {
        return {
            name: "main-worktree",
            passed: true,
            message: "Path is not in a git repository"
        };
    }

    // Branch worktree - allow operation
    if (worktreeType === "branch") {
        return {
            name: "main-worktree",
            passed: true,
            message: "Path is in a branch worktree"
        };
    }

    // Main worktree - block operation
    const repoName = basename(mainWorktreePath || path);
    const parentDir = dirname(mainWorktreePath || path);

    return {
        name: "main-worktree",
        passed: false,
        message: "Path is in the main worktree. Create a worktree first.",
        details: {
            worktreePath: mainWorktreePath || path,
            suggestion: `git worktree add ${parentDir}/${repoName}-issue-N branch-name`
        }
    };
}
