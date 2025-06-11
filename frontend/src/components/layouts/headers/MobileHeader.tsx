
import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title: string;
  bgColor?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const MobileHeader = ({ 
  title, 
  bgColor = "bg-green-600",
  showBackButton = false,
  onBackClick 
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`${bgColor} text-white shadow-sm`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="text-white hover:bg-white/20 p-2 mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
