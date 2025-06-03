
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {title && (
            <h1 className="text-lg font-semibold leading-7 text-gray-900">
              {title}
            </h1>
          )}
        </div>
        <div className="flex flex-1 justify-end items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-x-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
