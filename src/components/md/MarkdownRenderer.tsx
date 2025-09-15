"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";

import 'github-markdown-css/github-markdown-light.css';

// 可在这里将 md 元素映射为 shadcn/ui 风格
export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "append" }],
          rehypeRaw,
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
