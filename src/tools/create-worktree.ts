import { z } from "zod";
import {
    createWorktree,
    branchExists,
    getRepoRoot,
    listWorktrees
} from "../git/client.js";
import { basename, dirname, join } from "node:path";

export const createWorktreeSchema = z.object({
    repoPath: z
        .string()
        .describe("Path inside the repository"),
    branchName: z
        .string()
        .describe("Name of the branch to create or checkout"),
    worktreePath: z
        .string()
        .optional()
        .describe("Path for the new worktree (defaults to sibling directory)"),
    issueNumber: z
        .number()
        .optional()
        .describe("Issue number to include in worktree directory name"),
    baseBranch: z
        .string()
        .optional()
        .describe("Base branch for new branches (defaults to current branch)")
});

export type CreateWorktreeInput = z.infer<typeof createWorktreeSchema>;

export interface CreateWorktreeOutput {
    worktreePath: string;
    branchName: string;
    created: boolean;
    branchExisted: boolean;
    message: string;
}

/**
 * Create a new worktree for the given branch.
 * If the branch exists, checks it out. Otherwise, creates a new branch.
 */
export async function handleCreateWorktree(
    input: CreateWorktreeInput
): Promise<CreateWorktreeOutput> {
    const { branchName, issueNumber, baseBranch } = input;

    const repoRoot = await getRepoRoot(input.repoPath);
    const repoName = basename(repoRoot);
    const parentDir = dirname(repoRoot);

    // Check if branch already exists
    const exists = await branchExists(repoRoot, branchName);

    // Determine worktree path
    let worktreePath = input.worktreePath;
    if (!worktreePath) {
        const suffix = issueNumber
            ? `issue-${issueNumber}`
            : branchName.replace(/\//g, "-");
        worktreePath = join(parentDir, `${repoName}-${suffix}`);
    }

    // Check if worktree already exists at that path
    const existingWorktrees = await listWorktrees(repoRoot);
    const existingWorktree = existingWorktrees.find(
        w => w.path === worktreePath
    );

    if (existingWorktree) {
        return {
            worktreePath,
            branchName,
            created: false,
            branchExisted: exists,
            message: `Worktree already exists at ${worktreePath}`
        };
    }

    // Create the worktree
    await createWorktree(repoRoot, worktreePath, branchName, {
        createBranch: !exists,
        baseBranch: exists ? undefined : baseBranch
    });

    return {
        worktreePath,
        branchName,
        created: true,
        branchExisted: exists,
        message: exists
            ? `Created worktree for existing branch '${branchName}'`
            : `Created worktree with new branch '${branchName}'`
    };
}
