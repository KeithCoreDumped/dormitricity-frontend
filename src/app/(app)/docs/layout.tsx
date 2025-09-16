'use client';

import { ReactNode } from 'react';
import 'github-markdown-css/github-markdown-light.css';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="markdown-body prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl mx-auto p-4">
      {children}
    </div>
  );
}