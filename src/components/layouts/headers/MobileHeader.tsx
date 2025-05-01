
import React from "react";

interface MobileHeaderProps {
  title: string;
  userName?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title, userName }) => {
  return (
    <div className="bg-yulu-blue text-white p-4 shadow-md">
      <h1 className="text-xl font-semibold">{title}</h1>
      {userName && <p className="text-sm opacity-75">Hello, {userName}</p>}
    </div>
  );
};

export default MobileHeader;
