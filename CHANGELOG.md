# Changelog

## [0.1.0-rc.7] — 2026-08-19

- **view_image** tool: one-shot screenshot-or-image recognition; the Web UI
  renders the captured PNG (served by the `/dsh-vision` route) while the model
  context keeps the plain-text description only.
- `/dsh-vision` prefix route on the harness web server (basename-sanitised).
- `ViewImageToolView` card registered in the keyed `tool.call.toolview` slot.
- Peer ranges corrected for standalone installs (prerelease branch per the
  awesome-dsh-plugin guide; `@deepseek-ai/cordis` at `^4.0.0`).
- Zero-dependency `node:test` suite: package-contract meta tests and
  `buildScreenshotCommand` behaviour tests; GitHub Actions CI.

## [0.1.0-rc.6] — 2026-08-18

- Initial release: `take_screenshot`, `list_windows`, `analyze_image` tools;
  `vision` settings namespace; `gpt` recognition channel
  (`gpt-5.5` / `gpt-5.6-sol` / `gpt-5.6-terra`); API key through the
  `credentials` service; settings card in Settings → Plugins → Vision.
