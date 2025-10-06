
'use client';

import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const changeLanguage = (lng: string) => {
    // 获取当前路径的语言前缀和剩余部分
    // const pathParts = pathname?.split('/') || [];
    // const currentLocale = ['en', 'ja'].includes(pathParts[1]) ? pathParts[1] : '';
    // const pathWithoutLocale = currentLocale 
    //   ? pathname?.slice(3) || '/'  // 如果有语言前缀，去掉前缀和第二个斜杠
    //   : pathname || '/';           // 如果没有语言前缀，使用整个路径
    
    // 构建新的路径
    // const newPath = lng === 'zh' 
    //   ? pathWithoutLocale                    // 中文不需要前缀
    //   : `/${lng}${pathWithoutLocale}`;      // 其他语言添加前缀
    
    i18n.changeLanguage(lng);
    // router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('language.change')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          {t('language.en')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('zh')}>
          {t('language.zh')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('ja')}>
          {t('language.ja')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
