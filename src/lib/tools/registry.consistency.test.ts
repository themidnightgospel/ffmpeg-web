import { describe, it, expect } from 'vitest';
import { getTool, liveSlugs } from './registry';
import { CATEGORIES, defaultValues } from './types';
import { TOOLS } from '@/data/tools';

const liveMeta = TOOLS.filter((t) => t.status === 'live');

describe('registry ↔ catalogue consistency', () => {
  it('has no duplicate slugs in the catalogue', () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every catalogue category is a valid CATEGORY', () => {
    for (const t of TOOLS) expect(CATEGORIES).toContain(t.category);
  });

  it('every live catalogue tool has a registry config', () => {
    for (const meta of liveMeta) {
      expect(getTool(meta.slug), `missing registry config for ${meta.slug}`).toBeDefined();
    }
  });

  it('every registered tool is a live catalogue entry', () => {
    const metaSlugs = new Set(liveMeta.map((t) => t.slug));
    for (const slug of liveSlugs()) {
      expect(metaSlugs.has(slug), `registry tool ${slug} missing from catalogue`).toBe(true);
    }
  });

  it('registry and catalogue live counts match', () => {
    expect(liveSlugs().size).toBe(liveMeta.length);
  });

  it('registered tools agree with the catalogue on slug, name, and category', () => {
    for (const meta of liveMeta) {
      const tool = getTool(meta.slug)!;
      expect(tool.slug).toBe(meta.slug);
      expect(tool.name, `name drift for ${meta.slug}`).toBe(meta.name);
      expect(tool.category, `category drift for ${meta.slug}`).toBe(meta.category);
      expect(tool.status).toBe('live');
    }
  });

  it('every registered tool builds a command with its default option values', () => {
    for (const slug of liveSlugs()) {
      const tool = getTool(slug)!;
      // Exercise every tool's buildCommand with its real defaults: no throw,
      // non-empty argv + output name.
      const built = tool.buildCommand(defaultValues(tool.options), {
        name: 'sample.mp4',
        secondaryName: 'second.mp4',
        names: ['a.mp4', 'b.mp4'],
        durationSec: 30,
      });
      expect(built.args.length, `empty args for ${slug}`).toBeGreaterThan(0);
      expect(typeof built.outputName).toBe('string');
    }
  });
});
