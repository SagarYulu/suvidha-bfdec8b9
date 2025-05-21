
import React, { useEffect, useState } from 'react';
import { useSentiment } from '@/hooks/useSentiment';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import EmojiRatingSelector from './components/EmojiRatingSelector';
import UserMetadataCard from './components/UserMetadataCard';
import FeedbackTextarea from './components/FeedbackTextarea';
import TagSelection from './components/TagSelection';
import SubmitFeedbackButton from './components/SubmitFeedbackButton';

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
        <h2 className={`text-2xl font-semibold mb-2 text-gray-800 ${animateHeading ? 'animate-pulse' : ''}`}>
          How was your experience?
        </h2>
        <p className="text-gray-700 text-sm">आपका अनुभव कैसा रहा?</p>
      </div>

      {/* User Metadata Info Button and Card */}
      <UserMetadataCard 
        metadata={metadata}
        showMetadata={showUserMetadata}
        toggleMetadata={() => setShowUserMetadata(!showUserMetadata)}
      />
      
      {/* Emoji-based mood selector */}
      <EmojiRatingSelector 
        rating={rating}
        onRatingChange={handleRatingChange}
      />
      
      {/* Feedback Input */}
      <FeedbackTextarea 
        feedback={feedback}
        isAnalyzing={isAnalyzing}
        isSubmitting={isSubmitting}
        onFeedbackChange={handleFeedbackChange}
      />
      
      {/* Selected Tags */}
      <TagSelection 
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />
      
      {/* Submit Button */}
      <SubmitFeedbackButton 
        isSubmitting={isSubmitting}
        onSubmit={submitWithErrorHandling}
      />
    </div>
  );
};

export default MobileSentimentForm;
