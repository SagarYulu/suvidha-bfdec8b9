
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Menu,
  BarChart4,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Package,
  AlertCircle,
  Users
} from "lucide-react"
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigationItems: NavItemProps[] = [
    {
      href: "/admin/dashboard",
      icon: BarChart4,
      label: "Dashboard",
      description: "Analytics and reports"
    },
    {
      href: "/admin/issues",
      icon: AlertCircle,
      label: "Manage Issues",
      description: "View and manage reported issues"
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "Settings", 
      description: "System configuration"
    },
    {
      href: "/admin/backup",
      icon: Package,
      label: "Project Backup",
      description: "Create complete backup"
    },
  ];

  return (
    <>
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Menu className="md:hidden" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader className="text-left">
            <SheetTitle>Admin Menu</SheetTitle>
            <SheetDescription>
              Manage your account preferences and settings.
            </SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          <nav className="grid gap-6">
            {navigationItems.map((item) => (
              <Link key={item.href} to={item.href} className="flex items-center space-x-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Menu */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-gray-50 h-screen">
        <div className="p-4">
          <Link to="/admin/dashboard" className="flex items-center text-lg font-semibold">
            <Avatar className="mr-2 h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            TicketFlow Admin
          </Link>
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900",
                isActive(item.href) ? "bg-gray-100 text-gray-900" : "text-gray-500"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-full items-center justify-between rounded-md px-3 text-sm font-medium hover:bg-gray-100 hover:text-gray-900">
                Profile
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/admin/settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
