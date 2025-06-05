
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";

const NotificationSystem: React.FC = () => {
  return (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="h-4 w-4" />
      {/* Optional notification badge */}
      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
    </Button>
  );
};

export default NotificationSystem;
