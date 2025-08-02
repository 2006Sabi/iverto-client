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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-blue-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-8 pt-2 sm:pt-3">
            <ProfileComponent />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
