import { releaseViews } from '$lib/server/changelog'
import type { PageServerLoad } from './$types'

export const prerender = true

// The page is the repo-root CHANGELOG.md, parsed at build time (DS-0196) — nothing to maintain here.
export const load: PageServerLoad = () => ({ releases: releaseViews() })
