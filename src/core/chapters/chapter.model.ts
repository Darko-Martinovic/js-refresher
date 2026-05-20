export type SnippetLang = 'javascript' | 'typescript' | 'bash' | 'json';

export interface Snippet {
  language: SnippetLang;
  label?: string;
  code: string;
}

export interface Playground {
  label: string;
  description?: string;
  starter: string;
  expectedLogs?: string[];
}

export interface ExplorePointer {
  label: string;
  note?: string;
}

export interface RefLink {
  label: string;
  url: string;
}

export interface CodeCase {
  call: string;
  expected: unknown;
  expectedLogs?: string[];
  label?: string;
}

export type TaskValidator =
  | {
      kind: 'predict';
      options: string[];
      correct: number;
      explanation: string;
    }
  | {
      kind: 'input';
      accept: string[];
      explanation: string;
    }
  | {
      kind: 'self-check';
      explanation: string;
    }
  | {
      kind: 'code';
      starter: string;
      cases: CodeCase[];
      explanation: string;
    };

export interface Task {
  prompt: string;
  hint?: string;
  validator: TaskValidator;
}

export interface Chapter {
  slug: string;
  section: string;
  title: string;
  tagline: string;
  summary: string;
  keyPoints: string[];
  snippets: Snippet[];
  playgrounds: Playground[];
  pointers?: ExplorePointer[];
  tasks?: Task[];
  references: RefLink[];
  redFlags?: string[];
}

export interface ChapterSection {
  key: string;
  label: string;
  description: string;
  order: number;
}

export const SECTIONS: ChapterSection[] = [
  {
    key: 'scope',
    label: 'Variables, Scope & Closures',
    description: 'Declarations, scope rules, hoisting, closures, IIFE.',
    order: 1,
  },
  {
    key: 'types',
    label: 'Types, Equality & Coercion',
    description: 'Primitives vs references, == vs ===, NaN, truthy/falsy.',
    order: 2,
  },
  {
    key: 'functions',
    label: 'Functions, this & Prototypes',
    description: 'Function flavors, this binding, call/apply/bind, prototypes, classes, accessors.',
    order: 3,
  },
  {
    key: 'async',
    label: 'Async JavaScript & The Event Loop',
    description: 'Event loop, microtasks, Promises, async/await, combinators, generators.',
    order: 4,
  },
  {
    key: 'modern',
    label: 'Modern JS & Advanced Concepts',
    description: 'Modules, iteration protocol, Map/Set, Symbols, ES2020+.',
    order: 5,
  },
  {
    key: 'memory',
    label: 'Memory, Performance & Senior Judgment',
    description: 'GC, leaks, performance pitfalls, language evolution.',
    order: 6,
  },
];
