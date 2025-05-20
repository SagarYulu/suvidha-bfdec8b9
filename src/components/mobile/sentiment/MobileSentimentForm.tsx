import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSentiment } from '@/hooks/useSentiment';
import { Loader2, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/contexts/AuthContext';

interface MobileSentimentFormProps {
  showTrendAnalysis?: boolean;
}

const MobileSentimentForm: React.FC<MobileSentimentFormProps> = ({ showTrendAnalysis = false }) => {
  const { authState } = useAuth();
  const {
    rating,
    feedback,
    isSubmitting,
    tags,
    selectedTags,
    suggestedTags,
    isAnalyzing,
    handleRatingChange,
    handleFeedbackChange,
    handleTagToggle,
    handleAnalyzeFeedback,
    handleSubmit
  } = useSentiment();
  
  // Animation state for heading
  const [animateHeading, setAnimateHeading] = useState(true);
  // State for showing user metadata
  const [showUserMetadata, setShowUserMetadata] = useState(false);
  
  // Auto-analyze feedback when the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (feedback.trim().length > 20) {
        handleAnalyzeFeedback();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [feedback]);
  
  // Animate heading on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateHeading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // For custom submit with error handling
  const submitWithErrorHandling = async () => {
    try {
      await handleSubmit();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Emoji based on rating
  const getEmoji = (currentRating: number) => {
    if (currentRating === 1) return "😡";
    if (currentRating === 2) return "🙁";
    if (currentRating === 3) return "😐";
    if (currentRating === 4) return "🙂";
    return "😊";
  };

  // Mood text based on rating
  const getMoodText = (currentRating: number) => {
    if (currentRating === 1) return "Very Unhappy";
    if (currentRating === 2) return "Unhappy";
    if (currentRating === 3) return "Neutral";
    if (currentRating === 4) return "Happy";
    return "Very Happy";
  };

  // Extract user metadata for display
  const getUserMetadata = () => {
    const user = authState.user;
    if (!user) return { city: "Unknown", cluster: "Unknown", role: "Unknown" };
    
    let city = "Unknown";
    let cluster = "Unknown";
    let role = authState.role || "Unknown";
    
    if (typeof user === 'object') {
      if ('city' in user) city = (user as any).city || city;
      if ('cluster' in user) cluster = (user as any).cluster || cluster;
      
      if ('user_metadata' in user && user.user_metadata) {
        city = (user.user_metadata as any).city || city;
        cluster = (user.user_metadata as any).cluster || cluster;
      }
      
      if ('app_metadata' in user && user.app_metadata) {
        city = (user.app_metadata as any).city || city;
        cluster = (user.app_metadata as any).cluster || cluster;
      }
    }
    
    return { city, cluster, role };
  };
  
  const metadata = getUserMetadata();

  return (
    <div className="p-4 flex flex-col gap-4 pb-32 max-h-[90vh] overflow-y-auto">
      <div className="text-center">
        <h2 className={cn(
          "text-2xl font-semibold mb-2 text-gray-800",
          animateHeading && "animate-pulse"
        )}>
          How was your experience?
        </h2>
        <p className="text-gray-700 text-sm">आपका अनुभव कैसा रहा?</p>
      </div>

      {/* User Metadata Info Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="self-end text-gray-700 hover:bg-white hover:bg-opacity-15"
              onClick={() => setShowUserMetadata(!showUserMetadata)}
            >
              <Info className="h-4 w-4 mr-1" />
              Your Info
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view what information will be sent with your feedback</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showUserMetadata && (
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Your Information</h3>
          <div className="text-xs text-gray-800">
            <div className="flex justify-between py-1 border-b border-gray-700/20">
              <span>City:</span>
              <span className="font-medium">{metadata.city}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-700/20">
              <span>Cluster:</span>
              <span className="font-medium">{metadata.cluster}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Role:</span>
              <span className="font-medium">{metadata.role}</span>
            </div>
          </div>
          <p className="text-xs text-gray-700 mt-2">
            This information helps us categorize feedback appropriately.
          </p>
        </div>
      )}
      
      {/* Emoji-based mood selector - Simple vertical list of buttons */}
      <div className="flex flex-col space-y-2 mt-2">
        {[5, 4, 3, 2, 1].map((value) => (
          <button
            key={value}
            className={cn(
              "flex items-center py-3 px-4 rounded-lg transition-colors",
              rating === value 
                ? "bg-amber-400 text-gray-800 font-semibold" 
                : "bg-amber-200 hover:bg-amber-300 text-gray-800"
            )}
            onClick={() => handleRatingChange(value)}
          >
            <span className="text-xl mr-3">{getEmoji(value)}</span>
            <span className="font-medium">{getMoodText(value)}</span>
          </button>
        ))}
      </div>
      
      {/* Feedback Input - Optional */}
      <div className="bg-white/25 p-3 rounded-xl backdrop-blur-sm mt-4">
        <label className="block text-sm font-medium mb-2 text-gray-800">
          Tell us more about your experience (optional)
        </label>
        <div className="relative">
          <Textarea
            placeholder="Share your thoughts, concerns, or suggestions..."
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            className="min-h-[100px] max-h-[150px] resize-none bg-white border-none text-gray-800"
            disabled={isSubmitting}
          />
          {isAnalyzing && (
            <div className="absolute top-2 right-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </div>
      
      {/* Selected Tags Summary - Only shown if tags are selected */}
      {selectedTags.length > 0 && (
        <div className="bg-white/25 rounded-xl p-4 backdrop-blur-sm">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-800">
              Selected topics:
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <div key={tag} className="bg-yulu-dashboard-blue text-white text-xs rounded-full px-3 py-1 flex items-center">
                {tag}
                <button 
                  className="ml-1 hover:text-white/80" 
                  onClick={() => handleTagToggle(tag)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Fixed Submit Button at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-yulu-dashboard-blue to-yulu-dashboard-blue/90">
        <Button 
          className="w-full bg-white hover:bg-white/90 text-yulu-dashboard-blue hover:text-yulu-dashboard-blue text-lg font-medium py-6 rounded-xl shadow-lg"
          onClick={submitWithErrorHandling}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Submit Feedback
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MobileSentimentForm;
