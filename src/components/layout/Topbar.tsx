'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CircleUser, Menu } from "lucide-react";
import Link from "next/link";
import { removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { navLinks } from "./links";
import Image from "next/image";
import { CollapsibleNav } from "./CollapsibleNav";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Topbar() {
  const router = useRouter();
  const { t } = useTranslation();
  const links = navLinks(t);

  function logout() {
    removeToken();
    router.push("/login");
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t('topbar.toggle_nav')}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="sr-only">{t('topbar.nav_menu')}</SheetTitle>
          </SheetHeader>
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Image
                src="/dormitricity-logo.svg"
                alt="Dormitricity Logo"
                width={24}
                height={24}
              />
              <span className="sr-only">Dormitricity</span>
            </Link>
            {links.map((link) => (
              <CollapsibleNav key={link.label} link={link} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Add breadcrumbs here if needed */}
      </div>
      <LanguageSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">{t('topbar.toggle_user_menu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('topbar.my_account')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/account')}>{t('topbar.settings')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>{t('topbar.logout')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}