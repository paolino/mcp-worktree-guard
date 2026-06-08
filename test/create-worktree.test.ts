import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import { handleCreateWorktree } from "../src/tools/create-worktree.js";
import { getRepoRoot, bareLayoutContainer } from "../src/git/client.js";

// Absolute base path: the bare-layout setup passes directories as git
// arguments (clone source/target), which must be fully qualified.
const TEST_DIR = join(tmpdir(), "mcp-worktree-guard-create-test");

// Flat clone: a regular repository with a .git directory.
const FLAT_REPO = join(TEST_DIR, "flat-repo");

// Canonical bare + worktrees layout:
//   <container>/.bare   the bare repository
//   <container>/main    the primary worktree
const CONTAINER = join(TEST_DIR, "my-project");
const BARE = join(CONTAINER, ".bare");
const MAIN_WT = join(CONTAINER, "main");

describe("create-worktree default path", () => {
    before(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
        await mkdir(TEST_DIR, { recursive: true });

        // A flat clone with an initial commit on branch main.
        await mkdir(FLAT_REPO, { recursive: true });
        execSync("git init -b main", { cwd: FLAT_REPO });
        execSync('git config user.email "test@test.com"', { cwd: FLAT_REPO });
        execSync('git config user.name "Test User"', { cwd: FLAT_REPO });
        await writeFile(join(FLAT_REPO, "README.md"), "# Test Repo");
        execSync("git add .", { cwd: FLAT_REPO });
        execSync('git commit -m "Initial commit"', { cwd: FLAT_REPO });

        // Build the bare + worktrees layout from that flat clone.
        await mkdir(CONTAINER, { recursive: true });
        execSync(`git clone --bare "${FLAT_REPO}" "${BARE}"`, {
            cwd: CONTAINER
        });
        execSync(`git worktree add "${MAIN_WT}" main`, { cwd: BARE });
    });

    after(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
    });

    describe("bareLayoutContainer", () => {
        it("returns the container for a bare-layout worktree", async () => {
            const container = await bareLayoutContainer(MAIN_WT);
            assert.strictEqual(container, dirname(BARE));
        });

        it("returns null for a flat clone", async () => {
            const container = await bareLayoutContainer(FLAT_REPO);
            assert.strictEqual(container, null);
        });
    });

    describe("handleCreateWorktree", () => {
        it("defaults to a nested worktree beside main under the bare layout", async () => {
            const container = await bareLayoutContainer(MAIN_WT);
            assert.ok(container);

            const result = await handleCreateWorktree({
                repoPath: MAIN_WT,
                branchName: "feat/foo"
            });

            assert.strictEqual(result.worktreePath, join(container, "feat-foo"));
            assert.strictEqual(result.created, true);
        });

        it("keeps the sibling directory default for a flat clone", async () => {
            const root = await getRepoRoot(FLAT_REPO);
            const result = await handleCreateWorktree({
                repoPath: FLAT_REPO,
                branchName: "feat/bar"
            });

            assert.strictEqual(
                result.worktreePath,
                join(dirname(root), `${basename(root)}-feat-bar`)
            );
        });

        it("honors an explicit worktreePath under the bare layout", async () => {
            const explicit = join(TEST_DIR, "explicit-wt");
            const result = await handleCreateWorktree({
                repoPath: MAIN_WT,
                branchName: "feat/explicit",
                worktreePath: explicit
            });

            assert.strictEqual(result.worktreePath, explicit);
        });
    });
});
