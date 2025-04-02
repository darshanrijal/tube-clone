import { AuthButton } from "@/components/auth-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SearchInput } from "./search-input";

export const HomeNavbar = () => {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center bg-white px-2 pr-5">
      <div className="flex w-full items-center gap-4">
        <div className="flex shrink-0 items-center">
          <SidebarTrigger />
          <Link href="/" className="hidden md:block">
            <div className="flex items-center gap-1 p-4">
              <Image src="/logo.svg" alt="logo" width={32} height={32} />
              <p className="font-semibold text-xl tracking-tight">Tube</p>
            </div>
          </Link>
        </div>

        <div className="mx-auto max-w-[700px] flex-1 justify-center">
          <Suspense>
            <SearchInput />
          </Suspense>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
