
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Camera, Search, Settings, Shield, User, Eye, AlertTriangle } from 'lucide-react';

interface NavigationHeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  alertCount: number;
}

export const NavigationHeader = ({ activeView, setActiveView, alertCount }: NavigationHeaderProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'live-cameras', label: 'Live View', icon: Eye },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: alertCount > 0 ? alertCount : null },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Camera className="h-6 w-6" />
              <span className="font-bold text-lg">Guardian AI</span>
            </div>
            <Badge variant="outline" className="ml-2 text-xs">
              v2.1.0
            </Badge>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView(item.id)}
                className="relative flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-400 border-green-400/50">
              Online
            </Badge>
            <div className="text-sm text-muted-foreground">
              Security Officer
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
