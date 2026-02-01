#!/usr/bin/env bash
set -euo pipefail

# Compute npm dependencies hash and update flake.nix if changed

NEW_HASH=$(nix shell nixpkgs#prefetch-npm-deps --command prefetch-npm-deps package-lock.json 2>/dev/null)
OLD_HASH=$(grep -oP 'npmDepsHash = "\K[^"]+' flake.nix | head -1)

echo "Old hash: $OLD_HASH"
echo "New hash: $NEW_HASH"

if [ "$NEW_HASH" = "$OLD_HASH" ]; then
    echo "Hash unchanged"
    exit 0
fi

echo "Updating flake.nix..."
sed -i "s|npmDepsHash = \"sha256-[^\"]*\"|npmDepsHash = \"$NEW_HASH\"|g" flake.nix

if [ "${CI:-}" = "true" ]; then
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add flake.nix
    git commit -m "fix: update npmDepsHash for release"
    git push
fi

echo "Done"
