
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { submitSentiment, SentimentRating } from '@/services/sentimentService';

export const useSentimentSubmission = (
  rating: number, 
  feedback: string,
  selectedTags: string[]
) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { authState } = useAuth();
  
  // Helper function to fetch employee data when city/cluster is not available
  const fetchEmployeeData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('city, cluster, role')
        .eq('id', userId)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error("Error in fetchEmployeeData:", error);
      return { data: null, error };
    }
  };

  const handleSubmit = async () => {
    if (!authState.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit feedback.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Map rating to sentiment label and score
      let sentiment_label: string;
      let sentiment_score: number;
      
      switch (rating) {
        case 5: // Motivated
          sentiment_label = "very positive";
          sentiment_score = 1.0;
          break;
        case 4: // Happy
          sentiment_label = "positive";
          sentiment_score = 0.5;
          break;
        case 3: // Neutral
          sentiment_label = "neutral";
          sentiment_score = 0.0;
          break;
        case 2: // Frustrated
          sentiment_label = "negative";
          sentiment_score = -0.5;
          break;
        case 1: // Angry
          sentiment_label = "very negative";
          sentiment_score = -1.0;
          break;
        default:
          sentiment_label = "neutral";
          sentiment_score = 0.0;
      }
      
      // Check if user is defined and is an object (defensive programming)
      if (!authState.user || typeof authState.user !== 'object') {
        console.error("Invalid user data:", authState.user);
        throw new Error("Invalid user data");
      }
      
      console.log("Auth state user data:", authState.user);
      
      // Extract user metadata from multiple possible locations
      const user = authState.user;
      let city: string | undefined = undefined;
      let cluster: string | undefined = undefined;
      
      // Try to extract from all possible locations in the user object
      // 1. Try direct properties on user object
      if ('city' in user) {
        city = (user as any).city;
      }
      
      if ('cluster' in user) {
        cluster = (user as any).cluster;
      }
      
      // 2. Try user_metadata if available
      if (city === undefined && 'user_metadata' in user && user.user_metadata) {
        city = (user.user_metadata as any).city;
      }
      
      if (cluster === undefined && 'user_metadata' in user && user.user_metadata) {
        cluster = (user.user_metadata as any).cluster;
      }
      
      // 3. Try app_metadata if available
      if (city === undefined && 'app_metadata' in user && user.app_metadata) {
        city = (user.app_metadata as any).city;
      }
      
      if (cluster === undefined && 'app_metadata' in user && user.app_metadata) {
        cluster = (user.app_metadata as any).cluster;
      }
      
      // 4. Final fallback - try to extract from other user properties
      if (city === undefined && 'raw_user_meta_data' in user) {
        city = (user.raw_user_meta_data as any)?.city;
      }
      
      if (cluster === undefined && 'raw_user_meta_data' in user) {
        cluster = (user.raw_user_meta_data as any)?.cluster;
      }
      
      console.log("Final extracted user data for sentiment:", { 
        city, 
        cluster, 
        role: authState.role,
        userId: authState.user.id 
      });
      
      // If still no city/cluster, try to retrieve from employee data
      if (!city || !cluster) {
        try {
          console.log("Attempting to fetch city/cluster from employees table for user:", authState.user.id);
          const { data: employeeData, error } = await fetchEmployeeData(authState.user.id);
          
          if (!error && employeeData) {
            console.log("Retrieved employee data:", employeeData);
            city = city || employeeData.city;
            cluster = cluster || employeeData.cluster;
          } else if (error) {
            console.error("Error fetching employee data:", error);
          }
        } catch (err) {
          console.error("Exception fetching employee data:", err);
        }
      }
      
      const sentimentData: SentimentRating = {
        employee_id: authState.user.id,
        rating,
        feedback: feedback.trim() || undefined,
        city,
        cluster,
        role: authState.role || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sentiment_score: sentiment_score,
        sentiment_label: sentiment_label
      };
      
      console.log("Submitting sentiment data:", sentimentData);
      
      const { success, error } = await submitSentiment(sentimentData);
      
      if (success) {
        toast({
          title: "Thank You",
          description: "Your feedback has been submitted successfully!",
          variant: "default"
        });
        
        return true;
      } else {
        throw new Error(error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting sentiment:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit your feedback. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    setIsSubmitting,
    handleSubmit
  };
};
