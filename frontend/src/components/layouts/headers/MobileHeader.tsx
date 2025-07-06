
import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title = 'Yulu Suvidha', 
  showBack = false,
  onBack 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={handleBack}
              className="mr-3 p-1 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
