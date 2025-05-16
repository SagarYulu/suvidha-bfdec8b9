
import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSentiment } from '@/hooks/useSentiment';
import { Loader2, Info, CheckCircle, BarChart2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllSentiment } from '@/services/sentimentService';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TagTrendAnalysis from './TagTrendAnalysis';

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
  // State for showing trend analysis
  const [showTrends, setShowTrends] = useState(false);
  // State for sentiment data
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  // State for loading sentiment data
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('form');

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

  // Load sentiment data for trend analysis when tab is changed
  useEffect(() => {
    if (activeTab === 'trends' && sentimentData.length === 0) {
      loadSentimentData();
    }
  }, [activeTab]);

  // Load sentiment data
  const loadSentimentData = async () => {
    try {
      setIsLoadingSentiment(true);
      // Fetch sentiment data for the last 30 days
      const filters = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      };
      
      const data = await fetchAllSentiment(filters);
      setSentimentData(data);
    } catch (error) {
      console.error("Error loading sentiment data:", error);
      toast({
        title: "Error",
        description: "Failed to load trend analysis data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSentiment(false);
    }
  };

  // For custom submit with error handling
  const submitWithErrorHandling = async () => {
    try {
      await handleSubmit();
      // Switch to trends tab after successful submission
      if (showTrendAnalysis) {
        setActiveTab('trends');
        loadSentimentData();
      }
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
    if (currentRating === 1) return "Angry";
    if (currentRating === 2) return "Frustrated";
    if (currentRating === 3) return "Neutral";
    if (currentRating === 4) return "Happy";
    return "Motivated";
  };

  // Emotion description based on rating
  const getEmotionDescription = (currentRating: number) => {
    if (currentRating === 1) return "Angry, disrespected, anxious";
    if (currentRating === 2) return "Frustrated, unsatisfied, unacknowledged";
    if (currentRating === 3) return "Indifferent, routine, no specific highs/lows";
    if (currentRating === 4) return "Happy, content, comfortable";
    return "Excited, satisfied, motivated";
  };

  // Extract user metadata for display
  const getUserMetadata = () => {
    const user = authState.user;
    if (!user) return { city: "Unknown", cluster: "Unknown", role: "Unknown" };
    
    let city = "Unknown";
    let cluster = "Unknown";
    let role = authState.role || "Unknown";
    
    // Try to extract from different possible locations
    if (typeof user === 'object') {
      // Direct properties
      if ('city' in user) city = (user as any).city || city;
      if ('cluster' in user) cluster = (user as any).cluster || cluster;
      
      // User metadata
      if ('user_metadata' in user && user.user_metadata) {
        city = (user.user_metadata as any).city || city;
        cluster = (user.user_metadata as any).cluster || cluster;
      }
      
      // App metadata
      if ('app_metadata' in user && user.app_metadata) {
        city = (user.app_metadata as any).city || city;
        cluster = (user.app_metadata as any).cluster || cluster;
      }
    }
    
    return { city, cluster, role };
  };
  
  const metadata = getUserMetadata();

  // Render feedback form UI
  const renderFeedbackForm = () => (
    <div className="p-4 flex flex-col gap-4 pb-32 max-h-[90vh] overflow-y-auto">
      <div className="text-center">
        <h2 className={cn(
          "text-2xl font-semibold mb-2 text-white",
          animateHeading && "animate-pulse"
        )}>
          How are you feeling today?
        </h2>
        <p className="text-white/90 text-sm">Your feedback helps improve our workplace</p>
      </div>

      {/* User Metadata Info */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="self-end text-white/90 hover:bg-white hover:bg-opacity-15"
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
          <h3 className="text-sm font-medium text-white mb-2">Your Information</h3>
          <div className="text-xs text-white">
            <div className="flex justify-between py-1 border-b border-white/20">
              <span>City:</span>
              <span className="font-medium">{metadata.city}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/20">
              <span>Cluster:</span>
              <span className="font-medium">{metadata.cluster}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Role:</span>
              <span className="font-medium">{metadata.role}</span>
            </div>
          </div>
          <p className="text-xs text-white/80 mt-2">
            This information helps us categorize feedback appropriately.
          </p>
        </div>
      )}

      {/* Emoji Selection */}
      <div className="flex flex-col items-center gap-2 mt-1 bg-white/25 rounded-xl p-5 backdrop-blur-sm">
        <div className="text-6xl mb-2">{getEmoji(rating)}</div>
        <p className="text-lg font-medium text-white">{getMoodText(rating)}</p>
        <p className="text-sm text-white/90 text-center">{getEmotionDescription(rating)}</p>
      </div>
      
      {/* Emoji Selector (Horizontal Row) */}
      <div className="grid grid-cols-5 gap-2 mt-1">
        {[5, 4, 3, 2, 1].map((value) => (
          <button
            key={value}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg transition-all",
              rating === value 
                ? "bg-white/30 border-2 border-white shadow-lg transform scale-105" 
                : "hover:bg-white/20"
            )}
            onClick={() => handleRatingChange(value)}
          >
            <span className="text-2xl">{getEmoji(value)}</span>
            <span className="text-xs mt-1 text-white">{getMoodText(value)}</span>
          </button>
        ))}
      </div>
      
      {/* Hidden slider but keeping it for accessibility */}
      <div className="hidden">
        <Slider
          value={[rating]}
          min={1}
          max={5}
          step={1}
          onValueChange={(values) => handleRatingChange(values[0])}
        />
      </div>
      
      {/* Feedback Input */}
      <div className="bg-white/25 p-3 rounded-xl backdrop-blur-sm">
        <label className="block text-sm font-medium mb-2 text-white">
          Tell us more about your experience (optional)
        </label>
        <div className="relative">
          <Textarea
            placeholder="Share your thoughts, concerns, or suggestions..."
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            className="min-h-[100px] max-h-[150px] resize-none bg-white border-none"
            disabled={isSubmitting}
          />
          {isAnalyzing && (
            <div className="absolute top-2 right-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Word count */}
        <div className="text-right text-xs text-white/90 mt-1">
          {feedback.length} characters
        </div>
      </div>
      
      {/* Tags Section - Improved UI */}
      <div className="bg-white/25 rounded-xl p-4 mt-1 backdrop-blur-sm">
        <div className="mb-3">
          <label className="block text-sm font-medium text-white">
            Select topics related to your feedback:
          </label>
        </div>
        
        {tags && tags.length > 0 ? (
          <div className="flex flex-col gap-2.5 max-h-[40vh] overflow-y-auto pr-1 mobile-scrollbar">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              
              return (
                <div
                  key={tag.id}
                  className={cn(
                    "flex items-center rounded-lg py-3 px-3 transition-all",
                    isSelected ? "bg-yulu-dashboard-blue/20 border border-yulu-dashboard-blue" : "bg-white/90 border border-transparent"
                  )}
                >
                  <div className="mr-3">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleTagToggle(tag.name)}
                      className={cn(
                        "h-5 w-5 border-2",
                        isSelected ? "bg-yulu-dashboard-blue border-yulu-dashboard-blue" : "border-gray-400"
                      )}
                    />
                  </div>
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleTagToggle(tag.name)}
                  >
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="text-gray-900 font-medium text-sm cursor-pointer block"
                    >
                      {tag.name}
                    </label>
                    {tag.category && (
                      <span className="text-xs text-gray-600 block mt-0.5">
                        {tag.category}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-white" />
            <p className="text-white text-sm">Loading available topics...</p>
          </div>
        )}
        
        {/* Selected Tags Summary */}
        {selectedTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
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
        )}
      </div>
    </div>
  );

  // If showing trend analysis option
  if (showTrendAnalysis) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-2 bg-white/25 p-1">
          <TabsTrigger value="form" className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700">
            Feedback Form
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700">
            Trend Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          {renderFeedbackForm()}
          
          {/* Fixed Submit Button at bottom for form tab */}
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
        </TabsContent>
        
        <TabsContent value="trends" className="h-full">
          <TagTrendAnalysis data={sentimentData} isLoading={isLoadingSentiment} />
          
          {/* Fixed Back Button at bottom for trends tab */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-yulu-dashboard-blue to-yulu-dashboard-blue/90">
            <Button 
              className="w-full bg-white hover:bg-white/90 text-yulu-dashboard-blue hover:text-yulu-dashboard-blue text-lg font-medium py-6 rounded-xl shadow-lg"
              onClick={() => setActiveTab('form')}
            >
              Back to Feedback Form
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  // Regular form without trend analysis
  return (
    <>
      {renderFeedbackForm()}
      
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
    </>
  );
};

export default MobileSentimentForm;
