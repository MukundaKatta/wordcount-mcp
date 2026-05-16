# wordcount-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/wordcount-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/wordcount-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: count characters / words / sentences / paragraphs in a text and
estimate reading time at a configurable words-per-minute rate.

## Tool

### `count`

```json
{ "text": "Hello world. This is a test.", "wpm": 200 }
```

→

```json
{
  "characters": 28, "characters_no_spaces": 23,
  "words": 6, "sentences": 2, "paragraphs": 1,
  "reading_time_minutes": 0.03,
  "reading_time_display": "2 sec"
}
```

200 wpm is the commonly-cited average for English prose. Override `wpm` for
specialized content (technical docs ≈ 100-150, light fiction ≈ 300).

## Configure

```json
{ "mcpServers": { "wordcount": { "command": "npx", "args": ["-y", "@mukundakatta/wordcount-mcp"] } } }
```

## License

MIT.
