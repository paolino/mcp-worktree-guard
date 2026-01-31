import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    detectWorktreeSchema,
    handleDetectWorktree
} from "./tools/detect-worktree.js";
import { guardFileSchema, handleGuardFile } from "./tools/guard-file.js";
import {
    listWorktreesSchema,
    handleListWorktrees
} from "./tools/list-worktrees.js";
import {
    createWorktreeSchema,
    handleCreateWorktree
} from "./tools/create-worktree.js";

/**
 * Create and configure the MCP server.
 */
export function createServer(): McpServer {
    const server = new McpServer({
        name: "worktree-guard",
        version: "0.1.0"
    });

    // Register detect-worktree tool
    server.tool(
        "detect-worktree",
        "Detect if a path is in the main worktree, a branch worktree, or not a git repository",
        detectWorktreeSchema.shape,
        async (args) => {
            const input = detectWorktreeSchema.parse(args);
            const result = await handleDetectWorktree(input);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
    );

    // Register guard-file tool
    server.tool(
        "guard-file",
        "Check if a file modification is allowed (blocks changes in main worktree)",
        guardFileSchema.shape,
        async (args) => {
            const input = guardFileSchema.parse(args);
            const result = await handleGuardFile(input);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
    );

    // Register list-worktrees tool
    server.tool(
        "list-worktrees",
        "List all worktrees for the repository",
        listWorktreesSchema.shape,
        async (args) => {
            const input = listWorktreesSchema.parse(args);
            const result = await handleListWorktrees(input);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
    );

    // Register create-worktree tool
    server.tool(
        "create-worktree",
        "Create a new worktree for an issue or feature branch",
        createWorktreeSchema.shape,
        async (args) => {
            const input = createWorktreeSchema.parse(args);
            const result = await handleCreateWorktree(input);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
    );

    return server;
}

/**
 * Start the MCP server with stdio transport.
 */
export async function startServer(): Promise<void> {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
