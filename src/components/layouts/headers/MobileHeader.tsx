
import React from "react";
import { cn } from "@/lib/utils";

interface BaseHeaderProps {
  title: string;
  userName?: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  children?: React.ReactNode;
}

const MobileHeader: React.FC<BaseHeaderProps> = ({ 
  title, 
  userName, 
  className,
  bgColor = "bg-[#00CEDE]",
  textColor = "text-white",
  children
}) => {
  return (
    <div className={cn(`${bgColor} ${textColor} p-5 shadow-md`, className)}>
      <h1 className="text-xl font-semibold">{title}</h1>
      {userName && <p className="text-sm opacity-75">Hello, {userName}</p>}
      {children}
    </div>
  );
};

export default MobileHeader;
