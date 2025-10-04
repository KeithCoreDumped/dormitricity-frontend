import { ReactNode } from "react";
import "github-markdown-css/github-markdown-light.css";

export default function DocsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="markdown-body mx-auto p-4">
            {children}
        </div>
    );
}
