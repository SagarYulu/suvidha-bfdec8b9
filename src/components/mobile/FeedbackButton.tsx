
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Carousel,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";

const FeedbackButton: React.FC = () => {
  const navigate = useNavigate();
  const [autoplay, setAutoplay] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Messages to cycle through
  const messages = [
    "Share your feedback!",
    "We value your opinion",
    "How was your day?",
    "Help us improve!"
  ];

  useEffect(() => {
    if (autoplay) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % messages.length);
        
        if (carouselRef.current) {
          const items = carouselRef.current.querySelectorAll('.carousel-item');
          items.forEach((item, index) => {
            if (index === (currentIndex + 1) % messages.length) {
              (item as HTMLElement).style.opacity = '1';
              (item as HTMLElement).style.transform = 'translateX(0)';
            } else {
              (item as HTMLElement).style.opacity = '0';
              (item as HTMLElement).style.transform = 'translateX(20px)';
            }
          });
        }
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplay, currentIndex, messages.length]);

  const handleClick = () => {
    navigate('/mobile/sentiment');
  };

  const handleMouseEnter = () => {
    setAutoplay(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setAutoplay(true);
  };

  return (
    <div 
      className="fixed bottom-20 right-4 z-50 shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className="relative flex items-center bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg"
      >
        <div className="flex items-center">
          <div className="bike-container mr-2 relative">
            <img 
              src="/lovable-uploads/fde9d877-ef1b-4e54-b233-8e7a61cdad8e.png" 
              alt="Yulu Bike" 
              className="w-10 h-10 object-contain animate-bike"
            />
          </div>
          <div ref={carouselRef} className="overflow-hidden relative w-28">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`carousel-item absolute transition-all duration-500 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0 translate-x-5'
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

export default FeedbackButton;
