/**
 * Base class for git-related errors.
 */
export class GitError extends Error {
    constructor(
        message: string,
        public readonly command?: string,
        public readonly exitCode?: number
    ) {
        super(message);
        this.name = "GitError";
    }
}

/**
 * Thrown when a path is not inside a git repository.
 */
export class NotARepoError extends GitError {
    constructor(public readonly path: string) {
        super(`Not a git repository: ${path}`);
        this.name = "NotARepoError";
    }
}

/**
 * Thrown when a worktree operation fails.
 */
export class WorktreeError extends GitError {
    constructor(message: string, command?: string, exitCode?: number) {
        super(message, command, exitCode);
        this.name = "WorktreeError";
    }
}
