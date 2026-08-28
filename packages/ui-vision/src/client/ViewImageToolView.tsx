/**
 * The `view_image` tool's conversation card: shows the captured screenshot in
 * the Web UI while the model context keeps only the plain-text description.
 *
 * The host render emits a `[view-image: /dsh-vision/<file>]` marker in the
 * result text; this card parses the marker, renders the PNG (served by the
 * host's `/dsh-vision` route), and shows the description. The image bytes
 * never enter the model context.
 */

import type { ToolCallBlock } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: the tool.call.toolview slot declaration and owner props live in
// ui-tool; cross-package collaboration goes through the service, never a
// value import (client bundle purity gate).
import type {} from '@deepseek-ai/dsh-client-ui-tool/client'

/** Props the toolview renderer binds. */
export type ViewImageToolViewProps = PropsRuntime<'tool.call.toolview'> & PropsLocale<'vision'>

/** Marker line the host render emits for screenshot results. */
const SHOT_MARKER = /\[view-image: ([^\]]+)\]/

/**
 * Render the view_image call card.
 * @param props - the tool call block and locale.
 * @returns the image + description, or plain text when no screenshot marker.
 */
export function ViewImageToolView(props: ViewImageToolViewProps) {
  const block: ToolCallBlock = props.block
  // RunningToolCall carries no `kind` tag; only the settled result node does.
  if (!('kind' in block) || block.kind !== 'tool-result') return null
  const text = block.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map(b => b.text)
    .join('\n')
  const match = SHOT_MARKER.exec(text)
  if (match === null) {
    return <pre style={{ whiteSpace: 'pre-wrap' }}>{text}</pre>
  }
  const url = match[1]
  const description = text.replace(SHOT_MARKER, '').trim()
  return (
    <div>
      <img
        src={url}
        alt="view-image"
        style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }}
      />
      {description !== '' ? <p>{description}</p> : null}
    </div>
  )
}
