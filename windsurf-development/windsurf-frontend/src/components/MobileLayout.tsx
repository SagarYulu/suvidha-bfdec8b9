
import React from "react";
import { ArrowLeft, Home, Plus, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MobileLayoutProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  bgColor?: string;
  rightAction?: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  title,
  children,
  showBackButton = true,
  bgColor = "bg-blue-600",
  rightAction,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate("/mobile/issues");
  };

  const handleNewIssue = () => {
    navigate("/mobile/issues/new");
  };

  const handleProfile = () => {
    navigate("/mobile/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={`${bgColor} text-white relative`}>
        <div className="flex items-center justify-between p-4 pt-12">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <h1 className="text-lg font-semibold text-center flex-1 mx-4">
            {title}
          </h1>
          
          <div className="flex items-center">
            {rightAction}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewIssue}
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">New Issue</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleProfile}
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
