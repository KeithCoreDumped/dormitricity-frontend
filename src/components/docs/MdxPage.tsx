'use client';

import React, { useState, useEffect, ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from '@/app/(app)/loading';

interface MdxPageProps {
  docName: string;
}

const MdxPage: React.FC<MdxPageProps> = ({ docName }) => {
  const { i18n } = useTranslation();
  const [MdxComponent, setMdxComponent] = useState<ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMdx = async () => {
      setIsLoading(true);
      setError(null);
      const lang = i18n.language || 'en';
      try {
        // NOTE: The path is relative to the `src` directory, but dynamic import works this way.
        // We can't use a variable that covers the full path.
        const mdx = await import(`@/content/docs/${lang}/${docName}.mdx`);
        setMdxComponent(() => mdx.default);
      } catch (e) {
        console.error(`Failed to load doc: ${docName} for lang: ${lang}`, e);
        // Fallback to English if the current language's doc is not found
        try {
          const mdx = await import(`@/content/docs/en/${docName}.mdx`);
          setMdxComponent(() => mdx.default);
        } catch (fallbackError) {
          console.error(`Failed to load fallback English doc: ${docName}`, fallbackError);
          setError(`Could not load documentation file.`);
        }
      }
      finally {
        setIsLoading(false);
      }
    };

    loadMdx();
  }, [i18n.language, docName]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return MdxComponent ? <MdxComponent /> : null;
};

export default MdxPage;
