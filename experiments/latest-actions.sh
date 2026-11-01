#!/usr/bin/env bash
# Resolve latest release tag + commit SHA for each GitHub Action used.
for repo in "$@"; do
  tag=$(gh api "repos/$repo/releases/latest" --jq .tag_name 2>/dev/null)
  sha=$(gh api "repos/$repo/commits/$tag" --jq .sha 2>/dev/null)
  echo "$repo $tag $sha"
done
