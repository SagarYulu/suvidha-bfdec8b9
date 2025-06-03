
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useRBAC } from "@/contexts/RBACContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  TrendingUp,
  Heart
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { hasPermission } = useRBAC();
  const { checkAccess } = useRoleAccess();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      permission: "view:dashboard" as const
    },
    {
      name: "Issues",
      href: "/admin/issues",
      icon: FileText,
      permission: "manage:issues" as const
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      permission: "view_analytics" as const
    },
    {
      name: "Sentiment Analysis",
      href: "/admin/sentiment-analysis",
      icon: TrendingUp,
      permission: "view_analytics" as const
    },
    {
      name: "Feedback Analytics",
      href: "/admin/feedback-analytics",
      icon: Heart,
      permission: "view:feedback" as const
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      permission: "manage:users" as const
    },
    {
      name: "Security",
      href: "/admin/security",
      icon: Shield,
      permission: "access:security" as const
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      permission: "manage:settings" as const
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    checkAccess(item.permission, { redirectTo: false, showToast: false })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yulu-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Yulu Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-6">
            <nav className="px-3 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-yulu-blue text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Logout button */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {title && (
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
