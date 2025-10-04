"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { MDXProvider } from "@mdx-js/react";
import "github-markdown-css/github-markdown-light.css";

export default function DocsLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { i18n } = useTranslation();

    useEffect(() => {
        // Only redirect if we're at the root /docs path
        if (pathname === "/docs") {
            const currentLang = i18n.language || "en";
            router.replace(`/docs/${currentLang}`);
        }
    }, [router, i18n.language, pathname]);

    // render the children (the actual docs pages)
    return (
        <div className="markdown-body mx-auto p-4">
          <MDXProvider>
              {children}
          </MDXProvider>
        </div>
    );
}
