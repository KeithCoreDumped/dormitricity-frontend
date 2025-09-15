import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import MarkdownRenderer from "@/components/md/MarkdownRenderer";
import { notFound } from "next/navigation";

export const runtime = "nodejs"; 
const DOC_ROOT = path.join(process.cwd(), "src/content/docs");

async function readDoc(slugParts: string[]) {
  // 支持 /docs/a/b => content/docs/a/b.md
  const rel = slugParts.join("/");
  const candidates = [
    path.join(DOC_ROOT, `${rel}.md`),
    path.join(DOC_ROOT, rel, "index.md"),
  ];
  console.log(candidates[0])
  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, "utf-8");
      const { content, data } = matter(raw);
      return { content, frontmatter: data as Record<string, any> };
    } catch {}
  }
  return null;
}

export default async function DocPage(
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await params;
  const doc = await readDoc(slug);
  if (!doc) return notFound();
    console.log(doc);

  return (
    <div className="mx-auto w-full max-w-3xl py-8 px-4">
      {doc.frontmatter?.title && (
        <h1 className="mb-6 text-3xl font-bold">{doc.frontmatter.title}</h1>
      )}
      <MarkdownRenderer content={doc.content} />
    </div>
  );
}
