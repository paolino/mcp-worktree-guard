import { z } from "zod";
import { detectWorktree } from "../git/client.js";
import { runGuards } from "../guards/index.js";
import type { GuardReport } from "../types.js";
import { dirname } from "node:path";

export const guardFileSchema = z.object({
    filePath: z.string().describe("Path to the file being modified")
});

export type GuardFileInput = z.infer<typeof guardFileSchema>;

export interface GuardFileOutput {
    filePath: string;
    allowed: boolean;
    worktree: {
        type: "main" | "branch" | "not-a-repo";
        path: string;
        branch?: string | null;
    };
    report: GuardReport;
}

/**
 * Check if a file modification is allowed.
 * Blocks modifications in the main worktree.
 */
export async function handleGuardFile(
    input: GuardFileInput
): Promise<GuardFileOutput> {
    // Detect worktree from file's directory
    const dirPath = dirname(input.filePath);
    const detection = await detectWorktree(dirPath);

    const context = {
        path: input.filePath,
        worktreeType: detection.type,
        branch: detection.branch,
        mainWorktreePath: detection.mainWorktreePath
    };

    const report = runGuards(context);

    return {
        filePath: input.filePath,
        allowed: report.allPassed,
        worktree: {
            type: detection.type,
            path: detection.path,
            branch: detection.branch
        },
        report
    };
}
