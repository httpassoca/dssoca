#!/usr/bin/env node
/**
 * Release helper (DS-0077). Automates the safe-to-automate parts of the
 * git-flow release sequence — it ENCODES git-flow, it does not replace it:
 *
 *   release/x.y.z  →  main (PR, tag vX.Y.Z)  →  back-merge into develop
 *
 * Usage:
 *   pnpm release            # validate + print changelog stub + next steps
 *   pnpm release --write    # also insert the stub under ## [Unreleased] in CHANGELOG.md
 *
 * What it does (read-only unless --write):
 *   1. validates package.json#version is semver and greater than the last tag
 *   2. checks you are on the matching release/<version> branch (git-flow)
 *   3. drafts a Keep-a-Changelog stub from conventional commits since the last tag
 *   4. prints the remaining manual steps (PR, tag, publish --provenance, back-merge)
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sh = (cmd) => execSync(cmd, { cwd: root, encoding: 'utf8' }).trim()
const fail = (msg) => {
  console.error(`✗ ${msg}`)
  process.exit(1)
}
const ok = (msg) => console.log(`✓ ${msg}`)

const write = process.argv.includes('--write')

// ── 1. Version validation ──────────────────────────────────────────────────
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const version = pkg.version
const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/
if (!SEMVER.test(version)) fail(`package.json version "${version}" is not semver`)

const lastTag = sh('git tag --sort=-v:refname --list "v*"').split('\n')[0] || ''
if (lastTag) {
  const toNums = (v) => v.replace(/^v/, '').split('-')[0].split('.').map(Number)
  const [a, b] = [toNums(version), toNums(lastTag)]
  const greater = a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] > b[2]
  if (!greater) fail(`version ${version} is not greater than last tag ${lastTag}`)
  ok(`version ${version} > last tag ${lastTag}`)
} else {
  ok(`version ${version} (no previous tag found)`)
}

// ── 2. Branch check (git-flow) ──────────────────────────────────────────────
const branch = sh('git rev-parse --abbrev-ref HEAD')
const releaseBranch = `release/${version}`
if (branch === releaseBranch) {
  ok(`on ${releaseBranch}`)
} else {
  console.warn(`! on "${branch}", expected "${releaseBranch}"`)
  console.warn(`  create it with:  git checkout -b ${releaseBranch} develop`)
}

const dirty = sh('git status --porcelain')
if (dirty) console.warn('! working tree is not clean — commit or stash before tagging')

// ── 3. Changelog stub from conventional commits since the last tag ──────────
const range = lastTag ? `${lastTag}..HEAD` : 'HEAD'
const subjects = sh(`git log ${range} --no-merges --format=%s`).split('\n').filter(Boolean)

const SECTIONS = [
  ['feat', 'Added'],
  ['fix', 'Fixed'],
  ['perf', 'Changed'],
  ['refactor', 'Changed'],
  ['docs', 'Docs'],
  ['test', 'Tests'],
  ['chore', 'Chores'],
]
const groups = new Map()
for (const s of subjects) {
  const m = s.match(/^(\w+)(?:\([^)]*\))?(!)?:\s*(.+)$/)
  const [type, breaking, text] = m ? [m[1], m[2], m[3]] : ['other', '', s]
  const section = (SECTIONS.find(([t]) => t === type) ?? ['other', 'Other'])[1]
  if (!groups.has(section)) groups.set(section, [])
  groups.get(section).push(breaking ? `**BREAKING** ${text}` : text)
}

const today = new Date().toISOString().slice(0, 10)
const stub = [
  `## [${version}] — ${today}`,
  '',
  ...[...groups.entries()].flatMap(([section, items]) => [
    `### ${section}`,
    '',
    ...items.map((i) => `- ${i}`),
    '',
  ]),
].join('\n')

console.log('\n── changelog stub ──────────────────────────────────────────\n')
console.log(stub)

if (write) {
  const clPath = resolve(root, 'CHANGELOG.md')
  const cl = readFileSync(clPath, 'utf8')
  const anchor = '## [Unreleased]'
  if (!cl.includes(anchor)) fail(`CHANGELOG.md has no "${anchor}" section to insert under`)
  if (cl.includes(`## [${version}]`)) {
    console.warn(`! CHANGELOG.md already has a ${version} entry — not inserting`)
  } else {
    writeFileSync(clPath, cl.replace(anchor, `${anchor}\n\n${stub.trimEnd()}`))
    ok(`stub inserted into CHANGELOG.md — now edit it into human-readable notes`)
  }
}

// ── 4. Remaining manual steps (git-flow) ────────────────────────────────────
console.log(`
── next steps (manual, git-flow) ───────────────────────────
 1. polish CHANGELOG.md (the stub is raw commit subjects)
 2. push and open a PR:  ${releaseBranch} → main   (merge when CI is green)
 3. tag the merge commit on main:
      git checkout main && git pull
      git tag v${version} && git push origin v${version}
    then create the GitHub release for v${version}
 4. publish with provenance (npm 2FA):
      pnpm publish --access public --provenance --otp <code>
 5. back-merge:  main → develop  (PR or merge, per git-flow)
`)
