
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  title: string;
  bgColor?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const MobileHeader = ({ 
  title, 
  bgColor = "bg-blue-600", 
  showBack = true, 
  onBack 
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`${bgColor} text-white shadow-lg`}>
      <div className="flex items-center justify-between px-4 py-3">
        {showBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-8" />
        )}
        
        <h1 className="text-lg font-semibold text-center flex-1 px-2">
          {title}
        </h1>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
