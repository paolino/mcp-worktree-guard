import { z } from "zod";
import { detectWorktree } from "../git/client.js";
import { NotARepoError } from "../git/errors.js";

export const detectWorktreeSchema = z.object({
    path: z.string().describe("Path to check (file or directory)")
});

export type DetectWorktreeInput = z.infer<typeof detectWorktreeSchema>;

export interface DetectWorktreeOutput {
    type: "main" | "branch" | "not-a-repo";
    path: string;
    branch?: string | null;
    mainWorktreePath?: string;
}

/**
 * Detect if a path is in the main worktree, a branch worktree, or not a repo.
 */
export async function handleDetectWorktree(
    input: DetectWorktreeInput
): Promise<DetectWorktreeOutput> {
    try {
        const result = await detectWorktree(input.path);
        return {
            type: result.type,
            path: result.path,
            branch: result.branch,
            mainWorktreePath: result.mainWorktreePath
        };
    } catch (error) {
        if (error instanceof NotARepoError) {
            return {
                type: "not-a-repo",
                path: input.path
            };
        }
        throw error;
    }
}
