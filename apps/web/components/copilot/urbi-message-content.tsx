'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface UrbiMessageContentProps {
  content: string;
}

export function UrbiMessageContent({ content }: UrbiMessageContentProps) {
  return (
    <div className="text-sm leading-relaxed text-slate-800 space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed font-normal text-slate-800">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2 pl-0.5 list-none">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-slate-700 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] shrink-0 mt-1.5" />
              <span className="flex-1">{children}</span>
            </li>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 my-2 pl-4 list-decimal text-slate-700">
              {children}
            </ol>
          ),
          code: ({ children }) => (
            <code className="bg-slate-100 text-sky-950 px-1.5 py-0.5 rounded font-mono text-xs font-bold border border-slate-200">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <div className="p-2.5 px-3 my-2 rounded-xl bg-sky-50/80 border-l-3 border-[#0284C7] text-sm text-sky-950 font-medium">
              {children}
            </div>
          ),
          table: ({ children }) => (
            <div className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-xs">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 font-bold text-slate-700">{children}</th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 text-slate-700">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/80 transition-colors">{children}</tr>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 whitespace-nowrap">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
