---
id: DS-0143
type: task
title: "Automate npm publish — Trusted Publishing (OIDC) release workflow"
status: done
priority: low
tags: [ci, release, supply-chain]
depends_on: []
parent: null
epic: null
created: 2026-07-12
updated: 2026-07-12
---

## Description

Remove the last manual release step (npm 2FA OTP) by publishing from GitHub Actions via **npm
Trusted Publishing (OIDC)** — reverses the earlier "intentionally out of scope" decision now that
trusted publishing is mature. No token is stored anywhere; npm verifies the workflow's OIDC
identity and attaches provenance automatically.

- `.github/workflows/release.yml` — fires on `release: published` (+ `workflow_dispatch` with a
  `tag` input as an escape hatch for already-tagged versions). `permissions: id-token: write`,
  job `environment: release`, Node 24 + corepack pnpm (ci.yml conventions), guard step asserting
  the tag matches `package.json#version`, then
  `pnpm publish --access public --provenance --no-git-checks`.
- npmjs.com trusted-publisher config (package `dssoca`): repository `httpassoca/dssoca`,
  workflow filename `release.yml`, environment `release`, allowed action: publish. These names
  are load-bearing on both sides.
- CLAUDE.md → _Releasing_ step 4 rewritten; manual `--otp` publish remains the fallback.

## Acceptance criteria

- Creating a GitHub release publishes the tagged version to npm with provenance, no OTP.
- Workflow refuses to publish when the tag and `package.json` version disagree.
- `gh workflow run release.yml -f tag=vX.Y.Z` publishes an existing tag.
