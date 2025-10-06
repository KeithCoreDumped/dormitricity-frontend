'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SUPPORTED_LOCALES = ['en', 'ja', 'zh'];

export default function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // 从路径中获取语言
    const pathParts = pathname?.split('/') || [];
    const urlLocale = SUPPORTED_LOCALES.includes(pathParts[1]) ? pathParts[1] : 'zh';
    
    // 获取存储的语言偏好
    const storedLocale = localStorage.getItem('i18nextLng');
    
    // 如果URL中有语言前缀，使用URL中的语言
    if (urlLocale && SUPPORTED_LOCALES.includes(urlLocale)) {
      i18n.changeLanguage(urlLocale);
    }
    // 如果有存储的语言偏好，使用存储的语言
    else if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale)) {
      i18n.changeLanguage(storedLocale);
    }
    // 默认使用中文
    else {
      i18n.changeLanguage('zh');
    }
  }, [pathname]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
