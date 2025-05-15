
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { fetchUserIssues, IssueType } from '@/services/issues/issueCore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatTimeAgo } from '@/utils/dateUtils';
import { Tab, Tabs } from '@/components/ui/tabs';
import IssuesList from '@/components/mobile/issues/IssuesList';
import FeedbackFab from '@/components/mobile/FeedbackFab';

function Issues() {
  const [issues, setIssues] = useState<IssueType[]>([]);
  const [activeIssues, setActiveIssues] = useState<IssueType[]>([]);
  const [closedIssues, setClosedIssues] = useState<IssueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getIssues = async () => {
      try {
        setIsLoading(true);
        
        if (!authState.isAuthenticated || !authState.user?.id) {
          console.error("User not authenticated");
          setIsLoading(false);
          return;
        }

        const userIssues = await fetchUserIssues(authState.user.id);
        
        // Format the dates for display
        const formattedIssues = userIssues.map((issue: IssueType) => ({
          ...issue,
          created_at_formatted: formatTimeAgo(issue.created_at)
        }));
        
        setIssues(formattedIssues);
        
        // Filter active and closed issues
        const active = formattedIssues.filter(
          (issue: IssueType) => !['closed', 'resolved'].includes(issue.status?.toLowerCase() || '')
        );
        
        const closed = formattedIssues.filter(
          (issue: IssueType) => ['closed', 'resolved'].includes(issue.status?.toLowerCase() || '')
        );
        
        setActiveIssues(active);
        setClosedIssues(closed);
      } catch (error) {
        console.error("Error fetching issues:", error);
        toast({
          title: "Error",
          description: "Could not load your issues. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getIssues();
  }, [authState.isAuthenticated, authState.user?.id]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const feedbackMessages = [
    "We want your feedback!",
    "How was your experience?",
    "Share your thoughts!",
    "Help us improve!"
  ];

  return (
    <MobileLayout title="My Issues" bgColor="#1E40AF">
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <Tab value="active" text="Active Issues" />
          <Tab value="closed" text="Closed Issues" />
        </Tabs>

        <div className="mt-4">
          {activeTab === "active" ? (
            <div className="pb-20">
              <IssuesList issues={activeIssues} isLoading={isLoading} />
            </div>
          ) : (
            <div className="pb-20">
              <IssuesList issues={closedIssues} isLoading={isLoading} />
            </div>
          )}
        </div>

        <div className="fixed bottom-16 right-4 z-50">
          <button
            onClick={() => navigate('/mobile/issues/new')}
            className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          >
            <span className="text-2xl">+</span>
          </button>
        </div>
        
        {/* Adding the feedback button with animated bike */}
        <FeedbackFab messages={feedbackMessages} position="bottom-right" />
      </div>
    </MobileLayout>
  );
}

export default Issues;
