#!/bin/env bash

# shellcheck shell=bash
set -euo pipefail

echo "Publish Token: $(echo "$PUBLISH_TOKEN" | cut -c1-3)...***"

echo "=== Runtime Dependencies ==="
echo
echo "npm: $(npm -v)"
echo "node: $(node -v)"
echo "yarn: $(yarn -v)"
if command -v tsc &>/dev/null; then
    echo "tsc: OK"
    npm ls -g | grep typescript
fi
if command -v tfx &>/dev/null; then
    echo "tfx: OK"
    npm ls -g | grep tfx-cli
fi
echo

echo "=== Update Dependencies ==="
echo
yarn install
cd task/
yarn install
cd ..
echo

echo "=== Build Package ==="
echo
yarn package

echo "=== Create Extension ==="
echo
if [ "$BRANCH_NAME" == "main" ]; then
    configuration="configs/release.json"
elif [[ "$BRANCH_NAME" =~ ^release.* ]]; then
    configuration="configs/dev.json"
else
    echo "Branch $BRANCH_NAME is not configured for release."
    exit 1
fi
echo "Configuration: $configuration"
tfx extension create --manifest-globs vss-extension.json --overrides-file $configuration
echo

echo "=== Publish Extension ==="
echo
echo "tfx extension publish --manifest-globs vss-extension.json --overrides-file $configuration --token $PUBLISH_TOKEN"
echo

exit 0
