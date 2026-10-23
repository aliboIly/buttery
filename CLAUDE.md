@AGENTS.md

## Claude Code specifics
- Project instructions live in `AGENTS.md` (imported above) so every agent shares one source of truth. Edit rules there, not here.
- Use the `make-it-buttery` skill for any UI build or restyle.
- For reviews ("does this feel buttery?", "is this spec consistent?"), use a subagent that hasn't seen the code, so the work isn't grading itself.
- `@butteryui/mcp` is registered in `.mcp.json` and runs from `packages/mcp/dist`, so `pnpm build` first. Prefer its tools over guessing component APIs: `buttery_search`, then `buttery_get` with every id you need, `buttery_scaffold` for a whole page, and `buttery_lint` and `buttery_check_layout` before you call UI done.
