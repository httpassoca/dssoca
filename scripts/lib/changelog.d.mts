export const SECTIONS: [string, string][]
export function componentForScope(
  scope: string | undefined,
  names: readonly string[],
): string | undefined
export function formatCommit(
  subject: string,
  names?: readonly string[],
): { section: string; text: string }
export function draftSections(subjects: readonly string[], names?: readonly string[]): string
export function insertRelease(
  changelog: string,
  release: { version: string; date: string; sections: string; previousTag?: string },
): string | null
