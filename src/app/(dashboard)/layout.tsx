import { SessionProvider } from "@/components/providers/session-provider";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardFooter } from "@/components/dashboard/footer";
import { LowCreditWarning } from "@/components/credits/low-credit-warning";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <DashboardFooter />
        <LowCreditWarning threshold={5} />
      </div>
    </SessionProvider>
  );
}
