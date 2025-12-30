import { SessionProvider } from "@/components/providers/session-provider";
import { AdminHeader } from "@/components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <AdminHeader />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
