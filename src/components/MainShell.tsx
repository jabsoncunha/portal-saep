"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-screen w-full bg-[#f8fafc]">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 pl-72 print:pl-0 flex flex-col min-w-0 bg-[#f8fafc] print:bg-white">
        <div className="print:hidden">
          <Header />
        </div>
        <div className={`${pathname === "/" ? "-mt-[80px]" : "mt-0"} print:mt-0 flex-1 bg-[#f8fafc] print:bg-white`}>{children}</div>
        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </main>
  );
}
