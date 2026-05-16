#!/usr/bin/env node
/**
 * wordcount MCP server. One tool: `count`.
 *
 * Returns word / sentence / paragraph counts plus a reading-time estimate
 * (default 200 wpm — the commonly-cited average for English prose).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const VERSION = '0.1.0';

export interface CountResult {
  characters: number;
  characters_no_spaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  reading_time_minutes: number;
  reading_time_display: string;
}

export function count(text: string, wpm: number = 200): CountResult {
  if (wpm <= 0) throw new Error('wpm must be positive');
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  // Sentence boundary: . ! ? followed by whitespace or end.
  const sentences = text.trim() ? (text.match(/[.!?]+(?=\s|$)/g) ?? []).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim().length).length : 0;
  const mins = words / wpm;
  return {
    characters: text.length,
    characters_no_spaces: text.replace(/\s/g, '').length,
    words,
    sentences,
    paragraphs,
    reading_time_minutes: Math.round(mins * 100) / 100,
    reading_time_display: displayTime(mins),
  };
}

function displayTime(mins: number): string {
  if (mins < 1) return Math.max(1, Math.round(mins * 60)) + ' sec';
  const m = Math.floor(mins);
  const s = Math.round((mins - m) * 60);
  if (m < 60) return s > 0 ? `${m} min ${s} sec` : `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h} hr ${rm} min`;
}

const server = new Server({ name: 'wordcount', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'count',
    description:
      'Count characters / words / sentences / paragraphs in text and estimate reading time.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        wpm: { type: 'integer', default: 200, description: 'Words per minute for reading-time estimate.' },
      },
      required: ['text'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'count') return errorResult('unknown tool: ' + name);
    const a = args as unknown as { text: string; wpm?: number };
    return jsonResult(count(a.text, a.wpm ?? 200));
  } catch (err) {
    return errorResult('wordcount failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`wordcount MCP server v${VERSION} ready on stdio\n`);
}
