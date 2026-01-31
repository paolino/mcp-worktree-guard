import { z } from "zod";
import { listWorktrees, getRepoRoot } from "../git/client.js";
import type { WorktreeEntry } from "../git/types.js";

export const listWorktreesSchema = z.object({
    path: z.string().describe("Path inside the repository")
});

export type ListWorktreesInput = z.infer<typeof listWorktreesSchema>;

export interface ListWorktreesOutput {
    repoRoot: string;
    worktrees: WorktreeEntry[];
}

/**
 * List all worktrees for the repository containing the given path.
 */
export async function handleListWorktrees(
    input: ListWorktreesInput
): Promise<ListWorktreesOutput> {
    const repoRoot = await getRepoRoot(input.path);
    const worktrees = await listWorktrees(input.path);

    return {
        repoRoot,
        worktrees
    };
}
