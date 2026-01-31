/**
 * Represents a single git worktree entry.
 */
export interface WorktreeEntry {
    /** Absolute path to the worktree */
    path: string;
    /** HEAD commit SHA */
    head: string;
    /** Branch name (without refs/heads/) or null if detached */
    branch: string | null;
    /** Whether this is the main worktree */
    isMain: boolean;
    /** Whether HEAD is detached */
    isDetached: boolean;
    /** Whether the worktree is bare */
    isBare: boolean;
    /** Whether the worktree is locked */
    isLocked: boolean;
    /** Whether the worktree is prunable */
    isPrunable: boolean;
}

/**
 * Information about a git repository.
 */
export interface RepoInfo {
    /** Root path of the repository */
    root: string;
    /** Path to the main worktree */
    mainWorktreePath: string;
    /** Current branch name or null if detached */
    currentBranch: string | null;
    /** Whether the current path is in the main worktree */
    isMainWorktree: boolean;
}

/**
 * Type of worktree.
 */
export type WorktreeType = "main" | "branch" | "not-a-repo";

/**
 * Result of detecting worktree type.
 */
export interface WorktreeDetection {
    type: WorktreeType;
    path: string;
    branch?: string | null;
    mainWorktreePath?: string;
}
