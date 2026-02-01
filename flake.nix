{
  description = "MCP server enforcing git worktree-per-branch workflow";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        package = pkgs.buildNpmPackage {
          pname = "mcp-worktree-guard";
          version = self.shortRev or self.dirtyShortRev or "dev";

          src = ./.;

          npmDepsHash = "sha256-ALYb/RLqfn6hQopkELwDW+xPp4h8k7eE/L4l2wnwwmA=";

          buildPhase = ''
            npm run build
          '';

          installPhase = ''
            mkdir -p $out/bin $out/lib
            cp -r dist $out/lib/
            cp -r node_modules $out/lib/
            cp package.json $out/lib/

            cat > $out/bin/mcp-worktree-guard <<EOF
            #!/usr/bin/env bash
            exec ${pkgs.nodejs}/bin/node $out/lib/dist/src/index.js "\$@"
            EOF
            chmod +x $out/bin/mcp-worktree-guard
          '';

          meta = with pkgs.lib; {
            description = "MCP server enforcing git worktree-per-branch workflow";
            license = licenses.mit;
            maintainers = [ ];
          };
        };

        # Build artifact with compiled tests
        testBuild = pkgs.buildNpmPackage {
          pname = "mcp-worktree-guard-test-build";
          version = self.shortRev or self.dirtyShortRev or "dev";

          src = ./.;

          npmDepsHash = "sha256-ALYb/RLqfn6hQopkELwDW+xPp4h8k7eE/L4l2wnwwmA=";

          buildPhase = ''
            npm run build
          '';

          installPhase = ''
            mkdir -p $out/lib
            cp -r dist $out/lib/
            cp -r node_modules $out/lib/
            cp package.json $out/lib/
          '';
        };

        # Runnable test script
        unit-tests = pkgs.writeShellScriptBin "unit-tests" ''
          set -euo pipefail
          export PATH="${pkgs.git}/bin:$PATH"
          export HOME=$(mktemp -d)

          ${pkgs.git}/bin/git config --global user.email "test@test.com"
          ${pkgs.git}/bin/git config --global user.name "Test"
          ${pkgs.git}/bin/git config --global init.defaultBranch main

          cd ${testBuild}/lib
          ${pkgs.nodejs}/bin/node --test dist/test/*.test.js
        '';

      in {
        packages = {
          default = package;
          mcp-worktree-guard = package;
          unit-tests = unit-tests;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            git
            just
            nodePackages.typescript
            nodePackages.prettier
            python312Packages.mkdocs-material
            python312Packages.mkdocs
          ];
        };
      });
}
