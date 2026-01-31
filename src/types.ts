/**
 * Result of a single guard check.
 */
export interface GuardResult {
    /** Guard name */
    name: string;
    /** Whether the guard passed */
    passed: boolean;
    /** Human-readable message */
    message: string;
    /** Additional details */
    details?: Record<string, unknown>;
}

/**
 * Combined result of all guard checks.
 */
export interface GuardReport {
    /** Whether all guards passed */
    allPassed: boolean;
    /** Individual guard results */
    guards: GuardResult[];
}

/**
 * Context for running guards.
 */
export interface GuardContext {
    /** Path being checked */
    path: string;
    /** Worktree type */
    worktreeType: "main" | "branch" | "not-a-repo";
    /** Current branch name */
    branch?: string | null;
    /** Path to main worktree */
    mainWorktreePath?: string;
}
