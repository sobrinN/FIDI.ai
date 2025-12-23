import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CSSProperties } from 'react';

// Lazy load ReactMarkdown and syntax highlighter
// This reduces initial bundle size by ~200KB
const ReactMarkdown = lazy(() => import('react-markdown'));
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then((mod) => ({
    default: mod.Prism,
  }))
);

// Type for syntax highlighter styles
type SyntaxStyle = { [key: string]: CSSProperties };

interface CodeBlockProps {
  language: string;
  value: string;
}

/**
 * Code block component with syntax highlighting and copy functionality
 * Lazy loads SyntaxHighlighter to reduce bundle size
 */
const CodeBlock = ({ language, value }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<SyntaxStyle | null>(null);

  // Load style dynamically
  useEffect(() => {
    import('react-syntax-highlighter/dist/esm/styles/prism')
      .then((mod) => setStyle(mod.vscDarkPlus as SyntaxStyle))
      .catch(() => setStyle(null));
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </>
          )}
        </button>
      </div>
      <Suspense
        fallback={
          <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto border border-white/10">
            <code className="text-sm font-mono">{value}</code>
          </pre>
        }
      >
        {style ? (
          <SyntaxHighlighter
            language={language || 'text'}
            style={style}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              padding: '1.5rem',
              fontSize: '0.875rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            showLineNumbers={true}
          >
            {value}
          </SyntaxHighlighter>
        ) : (
          <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto border border-white/10">
            <code className="text-sm font-mono">{value}</code>
          </pre>
        )}
      </Suspense>
    </div>
  );
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Markdown renderer component with lazy loading
 * Reduces initial bundle size by deferring markdown library loading until needed
 *
 * Features:
 * - Lazy loads ReactMarkdown (~200KB savings)
 * - Syntax highlighting for code blocks
 * - Security: skips HTML and disallows dangerous elements
 * - Fallback display while loading
 */
export const MarkdownRenderer = React.memo(({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <Suspense fallback={<div className={className}>{content}</div>}>
      <div className={className}>
        <ReactMarkdown
          skipHtml={true}
          disallowedElements={['script', 'iframe', 'object', 'embed']}
          unwrapDisallowed={true}
          components={{
            code(props) {
              const { children, className, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              const value = String(children).replace(/\n$/, '');

              // Check if it's a code block (has language) or inline code
              return match ? (
                <CodeBlock language={language} value={value} />
              ) : (
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono" {...rest}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </Suspense>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
