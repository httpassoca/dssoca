/** Type surface of `serve-inspirations.mjs` for the vitest guard. */
export interface InspirationsServer {
  port: number
  url: string
  root: string
  close(): Promise<unknown>
}
export function fileAt(root: string, urlPath: string): string | null
export function startServer(port?: number, root?: string): Promise<InspirationsServer>
