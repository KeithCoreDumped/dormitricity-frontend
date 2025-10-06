'use client';

// import { useTranslation } from 'react-i18next';
// import Image from 'next/image';
import { Topbar } from "@/components/layout/Topbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { t } = useTranslation();

  return (
    <div className="grid min-h-screen w-full flex flex-col">
      <Topbar isAuthPage={true} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {children}
      </main>
    </div>
  );

  // return (
  //   <>
  //     {/* Caption Bar */}
  //     <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4">
  //       <div className="container mx-auto px-4 flex items-center justify-center">
  //         <Image
  //           src="/dormitricity-logo.svg"
  //           alt="Dormitricity Logo"
  //           width={32}
  //           height={32}
  //           className="mr-4"
  //         />
  //         <h1 className="text-xl font-bold">{t('app_name')}</h1>
  //       </div>
  //     </div>

  //     {/* Page Content */}
  //     <div className="min-h-[calc(100vh-4rem)]">
  //       {children}
  //     </div>
  //   </>
  // );
}