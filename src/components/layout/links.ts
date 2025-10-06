import { Home, FileText, Users } from "lucide-react";

export const navLinks = (t: (key: string) => string) => [
  { href: "/dashboard", label: t("sidebar.dashboard"), icon: Home },
  { href: "/account", label: t("sidebar.account"), icon: Users },
  {
    href: "/docs",
    label: t("sidebar.docs"),
    icon: FileText,
    subLinks: [
      {
        href: "/docs/getting-started",
        label: t("sidebar.getting_started"),
      },
      {
        href: "/docs/notification",
        label: t("sidebar.notification"),
      },
      { href: "/docs/about", label: t("sidebar.about") },
    ],
  },
];
