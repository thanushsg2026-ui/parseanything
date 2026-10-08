import React, { useMemo } from 'react';
import katex from 'katex';
import { EquationData } from '../../types/document.js';

interface LatexRendererProps {
  equation: EquationData;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ equation, className = '' }) => {
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(equation.latex, {
        displayMode: equation.displayMode !== false,
        throwOnError: false,
      });
    } catch (err) {
      return `<code class="text-rose-500 font-mono text-xs">${equation.latex}</code>`;
    }
  }, [equation.latex, equation.displayMode]);

  return (
    <div className={`p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] my-2 overflow-x-auto ${className}`}>
      <div
        className="text-center py-2 text-[var(--foreground)]"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
      {equation.explanation && (
        <div className="mt-3 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">Interpretation: </span>
          {equation.explanation}
        </div>
      )}
      {equation.variables && equation.variables.length > 0 && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs bg-[var(--background)] p-2.5 rounded-lg border border-[var(--border)]">
          {equation.variables.map((v, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--primary)]">
                {v.symbol}
              </span>
              <span className="text-[var(--muted)] truncate">{v.meaning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
