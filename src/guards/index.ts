import type { GuardContext, GuardReport } from "../types.js";
import { checkMainWorktree } from "./main-worktree.js";

/**
 * Run all guards for the given context.
 */
export function runGuards(context: GuardContext): GuardReport {
    const guards = [
        checkMainWorktree(context)
    ];

    return {
        allPassed: guards.every(g => g.passed),
        guards
    };
}
