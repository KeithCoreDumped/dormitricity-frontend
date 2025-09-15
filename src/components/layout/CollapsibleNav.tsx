
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { useState } from 'react';

type SubLink = {
  href: string;
  label: string;
};

type CollapsibleNavProps = {
  link: {
    href?: string;
    label: string;
    icon: LucideIcon;
    subLinks?: SubLink[];
  };
};

export function CollapsibleNav({ link }: CollapsibleNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(
    pathname.startsWith(link.href || ' ')
  );

  const isParentActive = !link.subLinks && pathname === link.href;

  const handleToggle = () => {
    if (link.subLinks) {
      setIsOpen(!isOpen);
    }
  };

  if (!link.subLinks) {
    return (
      <Link
        href={link.href!}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
          isParentActive ? 'bg-muted text-primary' : ''
        }`}
      >
        <link.icon className="h-4 w-4" />
        {link.label}
      </Link>
    );
  }

  return (
    <div>
      <div
        className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
          isOpen ? ' text-primary' : ''
        }`}
        onClick={handleToggle}
        role="button"
      >
        <div className="flex items-center gap-3">
          <link.icon className="h-4 w-4" />
          <span>{link.label}</span>
        </div>
        {link.subLinks && (
          <ChevronDown
            className={`h-4 w-4 transform transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>
      {isOpen && link.subLinks && (
        <div className="ml-7 flex flex-col gap-1 border-l pl-3">
          {link.subLinks.map((subLink) => (
            <Link
              key={subLink.href}
              href={subLink.href}
              className={`rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary ${
                pathname === subLink.href ? 'bg-muted text-primary' : ''
              }`}
            >
              {subLink.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
