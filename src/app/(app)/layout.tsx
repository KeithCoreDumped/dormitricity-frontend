'use client';

import { ReactNode } from "react";
// import { getToken } from "@/lib/auth";
// import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  // const router = useRouter();
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect(() => {
  //   const token = getToken();
  //   if (!token) {
  //     router.push("/login");
  //   } else {
  //     setIsLoggedIn(true);
  //   }
  // }, [router]);

  // if (!isLoggedIn) {
  //   return null; // or a loading spinner
  // }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Topbar />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}