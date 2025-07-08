import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Profile as ProfileComponent } from "@/components/Profile";

const Profile = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-10 shrink-0 items-center gap-4 border-0 px-4 sm:px-8 glass-effect">
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto p-2 sm:p-8 pt-2 sm:pt-3">
            <ProfileComponent />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
