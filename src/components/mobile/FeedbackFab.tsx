
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareHeart } from 'lucide-react';

interface FeedbackFabProps {
  messages?: string[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const FeedbackFab: React.FC<FeedbackFabProps> = ({
  messages = [
    "We want your feedback!",
    "How was your day?",
    "Share your thoughts!"
  ],
  position = 'bottom-right'
}) => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <button
        onClick={() => navigate('/mobile/sentiment')}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-pulse"
      >
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/fde9d877-ef1b-4e54-b233-8e7a61cdad8e.png" 
            alt="Yulu Bike" 
            className="w-8 h-8 object-contain animate-bike-ride" 
          />
          <div className="relative overflow-hidden h-5">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`absolute transition-opacity duration-500 whitespace-nowrap ${
                  idx === currentMessage ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {message}
              </div>
            ))}
          </div>
        </div>
      </button>
    </div>
  );
};

export default FeedbackFab;
