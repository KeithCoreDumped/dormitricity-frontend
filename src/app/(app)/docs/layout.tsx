'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import 'github-markdown-css/github-markdown-light.css';

export default function DocsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Only redirect if we're at the root /docs path
    if (pathname === '/docs') {
      const currentLang = i18n.language || 'en';
      router.replace(`/docs/${currentLang}`);
    }
  }, [router, i18n.language, pathname]);


  // render the children (the actual docs pages)
  return (
    <div className="markdown-body prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl mx-auto p-4">
      {children}
    </div>
  );
}