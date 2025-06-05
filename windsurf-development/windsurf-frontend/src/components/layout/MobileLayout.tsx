
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';
import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { realTimeService } from "@/services/realTimeService";

interface MobileLayoutProps {
  children?: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Subscribe to real-time notifications
    const unsubscribe = realTimeService.subscribeToAll((update) => {
      if (update.type === 'notification_received') {
        setNotificationCount(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">
            {language === 'hi' ? 'यूलू सुविधा' : 'Yulu Suvidha'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-white hover:bg-blue-700"
          >
            <Globe className="h-4 w-4 mr-1" />
            {language === 'hi' ? 'EN' : 'हि'}
          </Button>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h2 className="text-lg font-semibold">
                    {language === 'hi' ? 'मेन्यू' : 'Menu'}
                  </h2>
                </div>
                
                <div className="flex-1 py-4">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      {language === 'hi' ? 'स्वागत है' : 'Welcome'}
                    </div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-sm text-gray-600">{user?.email}</div>
                    <div className="text-sm text-gray-600">
                      {language === 'hi' ? 'कर्मचारी ID' : 'Employee ID'}: {user?.employeeId}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={toggleLanguage}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    {language === 'hi' ? 'लॉगआउट' : 'Logout'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children || <Outlet />}
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation 
        language={language} 
        notificationCount={notificationCount}
      />
    </div>
  );
};

export default MobileLayout;
