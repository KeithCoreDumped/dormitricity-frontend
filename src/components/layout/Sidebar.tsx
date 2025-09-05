'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Settings, Users } from "lucide-react";

export const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/subs", label: "Subscriptions", icon: Package },
  { href: "/account", label: "Account", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Settings className="h-6 w-6" />
            <span className="">Dormitricity</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                  pathname === link.href ? "bg-muted text-primary" : ""
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}