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

          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

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

      in {
        packages = {
          default = package;
          mcp-worktree-guard = package;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            just
            nodePackages.typescript
            nodePackages.prettier
          ];
        };
      });
}
