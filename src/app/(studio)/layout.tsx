import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "./_components/studio-navbar";
import { StudioSidebar } from "./_components/studio-sidebar";

export default function StudioLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="w-full">
        <StudioNavbar />
        <div className="flex min-h-screen pt-16">
          <StudioSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
