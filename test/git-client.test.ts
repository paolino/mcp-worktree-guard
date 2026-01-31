import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execSync } from "node:child_process";
import {
    getRepoRoot,
    isGitRepo,
    isMainWorktree,
    detectWorktree,
    listWorktrees,
    createWorktree,
    branchExists
} from "../src/git/client.js";
import { NotARepoError } from "../src/git/errors.js";

const TEST_DIR = "/tmp/mcp-worktree-guard-test";
const MAIN_REPO = join(TEST_DIR, "main-repo");
const WORKTREE_PATH = join(TEST_DIR, "worktree-branch");

describe("git client", () => {
    before(async () => {
        // Clean up any existing test directory
        await rm(TEST_DIR, { recursive: true, force: true });
        await mkdir(TEST_DIR, { recursive: true });

        // Create a test git repository
        await mkdir(MAIN_REPO, { recursive: true });
        execSync("git init", { cwd: MAIN_REPO });
        execSync("git config user.email 'test@test.com'", { cwd: MAIN_REPO });
        execSync("git config user.name 'Test User'", { cwd: MAIN_REPO });

        // Create initial commit
        await writeFile(join(MAIN_REPO, "README.md"), "# Test Repo");
        execSync("git add .", { cwd: MAIN_REPO });
        execSync("git commit -m 'Initial commit'", { cwd: MAIN_REPO });
    });

    after(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
    });

    describe("isGitRepo", () => {
        it("returns true for git repo", async () => {
            const result = await isGitRepo(MAIN_REPO);
            assert.strictEqual(result, true);
        });

        it("returns false for non-repo", async () => {
            const result = await isGitRepo("/tmp");
            assert.strictEqual(result, false);
        });
    });

    describe("getRepoRoot", () => {
        it("returns repo root", async () => {
            const root = await getRepoRoot(MAIN_REPO);
            assert.strictEqual(root, MAIN_REPO);
        });

        it("throws NotARepoError for non-repo", async () => {
            await assert.rejects(
                () => getRepoRoot("/tmp"),
                NotARepoError
            );
        });
    });

    describe("isMainWorktree", () => {
        it("returns true for main worktree", async () => {
            const result = await isMainWorktree(MAIN_REPO);
            assert.strictEqual(result, true);
        });
    });

    describe("detectWorktree", () => {
        it("detects main worktree", async () => {
            const result = await detectWorktree(MAIN_REPO);
            assert.strictEqual(result.type, "main");
            assert.strictEqual(result.path, MAIN_REPO);
        });

        it("detects non-repo", async () => {
            const result = await detectWorktree("/tmp");
            assert.strictEqual(result.type, "not-a-repo");
        });
    });

    describe("listWorktrees", () => {
        it("lists single main worktree", async () => {
            const worktrees = await listWorktrees(MAIN_REPO);
            assert.strictEqual(worktrees.length, 1);
            assert.strictEqual(worktrees[0].isMain, true);
            assert.strictEqual(worktrees[0].path, MAIN_REPO);
        });
    });

    describe("branchExists", () => {
        it("returns true for existing branch", async () => {
            const exists = await branchExists(MAIN_REPO, "master");
            // Could be master or main depending on git config
            const mainExists = await branchExists(MAIN_REPO, "main");
            assert.ok(exists || mainExists);
        });

        it("returns false for non-existing branch", async () => {
            const exists = await branchExists(MAIN_REPO, "nonexistent");
            assert.strictEqual(exists, false);
        });
    });

    describe("createWorktree", () => {
        it("creates new worktree with new branch", async () => {
            await createWorktree(MAIN_REPO, WORKTREE_PATH, "test-branch", {
                createBranch: true
            });

            const worktrees = await listWorktrees(MAIN_REPO);
            assert.strictEqual(worktrees.length, 2);

            const branchWorktree = worktrees.find(
                w => w.path === WORKTREE_PATH
            );
            assert.ok(branchWorktree);
            assert.strictEqual(branchWorktree.branch, "test-branch");
            assert.strictEqual(branchWorktree.isMain, false);
        });

        it("detects branch worktree correctly", async () => {
            const result = await detectWorktree(WORKTREE_PATH);
            assert.strictEqual(result.type, "branch");
            assert.strictEqual(result.mainWorktreePath, MAIN_REPO);
        });

        it("isMainWorktree returns false for branch worktree", async () => {
            const result = await isMainWorktree(WORKTREE_PATH);
            assert.strictEqual(result, false);
        });
    });
});
