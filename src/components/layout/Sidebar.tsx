'use client';

import Link from "next/link";
import Image from "next/image";
import { CollapsibleNav } from "@/components/layout/CollapsibleNav";
import { useTranslation } from "react-i18next";
import { navLinks } from "./links";
import { AuthGate } from "./AuthGate";

export function Sidebar() {
  const { t } = useTranslation();
  const links = navLinks(t);

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/dormitricity-logo.svg"
              alt="Dormitricity Logo"
              width={24}
              height={24}
            />
            <span className="">Dormitricity</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {links.map((link) => (
              <CollapsibleNav key={link.label} link={link} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
