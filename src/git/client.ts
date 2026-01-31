import { exec } from "node:child_process";
import { stat, readFile } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { GitError, NotARepoError, WorktreeError } from "./errors.js";
import type { WorktreeEntry, WorktreeDetection } from "./types.js";

const execAsync = promisify(exec);

/**
 * Execute a git command and return stdout.
 */
async function git(
    args: string[],
    cwd: string
): Promise<string> {
    const command = `git ${args.join(" ")}`;
    try {
        const { stdout } = await execAsync(command, { cwd });
        return stdout.trim();
    } catch (error) {
        const err = error as { code?: number; stderr?: string };
        throw new GitError(
            err.stderr || "Git command failed",
            command,
            err.code
        );
    }
}

/**
 * Get the root of the git repository containing the given path.
 */
export async function getRepoRoot(path: string): Promise<string> {
    try {
        return await git(["rev-parse", "--show-toplevel"], path);
    } catch (error) {
        if (error instanceof GitError) {
            throw new NotARepoError(path);
        }
        throw error;
    }
}

/**
 * Check if a path is inside a git repository.
 */
export async function isGitRepo(path: string): Promise<boolean> {
    try {
        await getRepoRoot(path);
        return true;
    } catch (error) {
        if (error instanceof NotARepoError) {
            return false;
        }
        throw error;
    }
}

/**
 * Check if the given path is in the main worktree.
 *
 * Main worktree: .git is a directory
 * Branch worktree: .git is a file containing gitdir pointer
 */
export async function isMainWorktree(path: string): Promise<boolean> {
    const root = await getRepoRoot(path);
    const gitPath = join(root, ".git");

    try {
        const stats = await stat(gitPath);
        return stats.isDirectory();
    } catch {
        // If .git doesn't exist, this is unusual but treat as not main
        return false;
    }
}

/**
 * Get the path to the main worktree from a branch worktree.
 *
 * For branch worktrees, .git is a file containing:
 * gitdir: /path/to/main/.git/worktrees/<name>
 */
export async function getMainWorktreePath(path: string): Promise<string> {
    const root = await getRepoRoot(path);
    const gitPath = join(root, ".git");

    const stats = await stat(gitPath);

    if (stats.isDirectory()) {
        // This IS the main worktree
        return root;
    }

    // Parse the .git file to find the main worktree
    const content = await readFile(gitPath, "utf-8");
    const match = content.match(/^gitdir:\s*(.+)$/m);

    if (!match) {
        throw new WorktreeError(`Invalid .git file format at ${gitPath}`);
    }

    // The gitdir points to .git/worktrees/<name>
    // We need to go up to find the main worktree
    const gitdir = match[1].trim();
    // Handle both absolute and relative paths
    const absoluteGitdir = resolve(root, gitdir);

    // Go up from .git/worktrees/<name> to the main worktree:
    // dirname(worktrees/<name>) -> worktrees
    // dirname(worktrees) -> .git
    // dirname(.git) -> main-worktree
    return dirname(dirname(dirname(absoluteGitdir)));
}

/**
 * Get the current branch name.
 */
export async function getCurrentBranch(path: string): Promise<string | null> {
    try {
        const branch = await git(
            ["rev-parse", "--abbrev-ref", "HEAD"],
            path
        );
        return branch === "HEAD" ? null : branch;
    } catch {
        return null;
    }
}

/**
 * Detect the worktree type for a given path.
 */
export async function detectWorktree(path: string): Promise<WorktreeDetection> {
    const absolutePath = resolve(path);

    if (!(await isGitRepo(absolutePath))) {
        return {
            type: "not-a-repo",
            path: absolutePath
        };
    }

    const root = await getRepoRoot(absolutePath);
    const isMain = await isMainWorktree(absolutePath);
    const branch = await getCurrentBranch(absolutePath);

    if (isMain) {
        return {
            type: "main",
            path: root,
            branch,
            mainWorktreePath: root
        };
    }

    const mainPath = await getMainWorktreePath(absolutePath);

    return {
        type: "branch",
        path: root,
        branch,
        mainWorktreePath: mainPath
    };
}

/**
 * Parse the porcelain output of git worktree list.
 */
function parseWorktreeList(output: string): WorktreeEntry[] {
    const entries: WorktreeEntry[] = [];
    const blocks = output.split("\n\n").filter(Boolean);

    for (const block of blocks) {
        const lines = block.split("\n");
        const entry: Partial<WorktreeEntry> = {
            isDetached: false,
            isBare: false,
            isLocked: false,
            isPrunable: false,
            isMain: false
        };

        for (const line of lines) {
            if (line.startsWith("worktree ")) {
                entry.path = line.slice(9);
            } else if (line.startsWith("HEAD ")) {
                entry.head = line.slice(5);
            } else if (line.startsWith("branch ")) {
                // Remove refs/heads/ prefix
                const fullRef = line.slice(7);
                entry.branch = fullRef.replace(/^refs\/heads\//, "");
            } else if (line === "detached") {
                entry.isDetached = true;
                entry.branch = null;
            } else if (line === "bare") {
                entry.isBare = true;
            } else if (line === "locked") {
                entry.isLocked = true;
            } else if (line === "prunable") {
                entry.isPrunable = true;
            }
        }

        if (entry.path && entry.head) {
            entries.push(entry as WorktreeEntry);
        }
    }

    // Mark the first entry as main (git lists main first)
    if (entries.length > 0) {
        entries[0].isMain = true;
    }

    return entries;
}

/**
 * List all worktrees for the repository.
 */
export async function listWorktrees(path: string): Promise<WorktreeEntry[]> {
    const root = await getRepoRoot(path);
    const output = await git(["worktree", "list", "--porcelain"], root);
    return parseWorktreeList(output);
}

/**
 * Check if a branch exists locally.
 */
export async function branchExists(
    path: string,
    branchName: string
): Promise<boolean> {
    try {
        await git(
            ["rev-parse", "--verify", `refs/heads/${branchName}`],
            path
        );
        return true;
    } catch {
        return false;
    }
}

/**
 * Create a new worktree.
 */
export async function createWorktree(
    repoPath: string,
    worktreePath: string,
    branchName: string,
    options: {
        createBranch?: boolean;
        baseBranch?: string;
    } = {}
): Promise<void> {
    const root = await getRepoRoot(repoPath);
    const absoluteWorktreePath = resolve(worktreePath);

    const args = ["worktree", "add"];

    if (options.createBranch) {
        args.push("-b", branchName);
        args.push(absoluteWorktreePath);
        if (options.baseBranch) {
            args.push(options.baseBranch);
        }
    } else {
        args.push(absoluteWorktreePath, branchName);
    }

    try {
        await git(args, root);
    } catch (error) {
        if (error instanceof GitError) {
            throw new WorktreeError(
                `Failed to create worktree: ${error.message}`,
                error.command,
                error.exitCode
            );
        }
        throw error;
    }
}
