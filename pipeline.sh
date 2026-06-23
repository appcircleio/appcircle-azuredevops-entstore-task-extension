#!/bin/env bash
# shellcheck shell=bash
set -euo pipefail

# Release pipeline for the Appcircle Enterprise App Store Azure DevOps extension.
#
# Policy (aligned with the other Appcircle plugins, adapted to the Visual Studio
# Marketplace, which does NOT support pre-release/beta versions):
#   * Only a push/merge to the default branch (main) publishes a PRODUCTION version.
#   * There is no beta channel.
#   * The version is derived from the latest git tag (vX.Y.Z) — tagging is manual.

echo "Publish Token: $(echo "${PUBLISH_TOKEN:-}" | cut -c1-3)...***"

# --- Only main publishes. No beta. ------------------------------------------
if [ "${BRANCH_NAME:-}" != "main" ]; then
    echo "Branch '${BRANCH_NAME:-unknown}' is not 'main' — nothing to publish."
    exit 0
fi

echo "=== Runtime Dependencies ==="
node -v
yarn -v
command -v tfx >/dev/null 2>&1 && echo "tfx: OK"

# --- Version source of truth = latest git tag (manual tagging) --------------
git fetch --tags --force || true
LATEST_TAG="$(git describe --tags --abbrev=0 2>/dev/null || true)"
VERSION="${LATEST_TAG#v}"
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo "ERROR: latest git tag '${LATEST_TAG:-<none>}' is not a clean vX.Y.Z." >&2
    exit 1
fi
echo "Publishing version: $VERSION (from tag ${LATEST_TAG})"

echo "=== Install Dependencies ==="
yarn install
(cd task && yarn install)

# --- Inject the git-tag version into the manifests --------------------------
node -e '
const fs = require("fs");
const v = process.argv[1].split(".");
const task = JSON.parse(fs.readFileSync("task/task.json"));
task.version = { Major: +v[0], Minor: +v[1], Patch: +v[2] };
fs.writeFileSync("task/task.json", JSON.stringify(task, null, 2) + "\n");
const ext = JSON.parse(fs.readFileSync("vss-extension.json"));
ext.version = process.argv[1];
fs.writeFileSync("vss-extension.json", JSON.stringify(ext, null, 2) + "\n");
console.log("Manifests set to " + process.argv[1]);
' "$VERSION"

echo "=== Build Package ==="
yarn package

echo "=== Create & Publish Extension (public production) ==="
tfx extension create --manifest-globs vss-extension.json --overrides-file configs/release.json
tfx extension publish --manifest-globs vss-extension.json --overrides-file configs/release.json --token "$PUBLISH_TOKEN"

exit 0
