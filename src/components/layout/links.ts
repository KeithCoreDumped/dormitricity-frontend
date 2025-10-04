import { Home, FileText, Users } from "lucide-react";

export const navLinks = (
    t: (key: string) => string,
    currentLang: string = 'en'
) => [
    { href: "/", label: t('sidebar.dashboard'), icon: Home },
    { href: "/account", label: t('sidebar.account'), icon: Users },
    {
        href: "/docs",
        label: t('sidebar.docs'),
        icon: FileText,
        subLinks: [
            { href: `/docs/${currentLang}/getting-started`, label: t('sidebar.getting_started') },
            { href: `/docs/${currentLang}/notification`, label: t('sidebar.notification') },
            { href: `/docs/${currentLang}/about`, label: t('sidebar.about') },
        ],
    },
];
