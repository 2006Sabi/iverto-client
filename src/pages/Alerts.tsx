import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AnomalyAlerts } from "@/components/AnomalyAlerts";

const Alerts = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 overflow-auto p-4 sm:p-8">
            <AnomalyAlerts />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Alerts;
