@AGENTS.md

## Claude Code specifics
- Project instructions live in `AGENTS.md` (imported above) so every agent shares one source of truth. Edit rules there, not here.
- Use the `make-it-buttery` skill for any UI build or restyle.
- For reviews ("does this feel buttery?", "is this spec consistent?"), use a subagent that hasn't seen the code, so the work isn't grading itself.
- Once `@buttery/mcp` exists (Phase 8), it's registered in `.mcp.json` — prefer its tools over guessing component APIs.
