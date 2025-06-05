
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MobileIssues = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for issues
    const mockIssues = [
      {
        id: '1',
        title: 'Login Problem',
        description: 'Cannot access employee portal',
        status: 'open',
        priority: 'high',
        createdAt: '2024-01-15T10:30:00Z',
        category: 'technical'
      },
      {
        id: '2',
        title: 'Salary Query',
        description: 'Questions about monthly salary calculation',
        status: 'in_progress',
        priority: 'medium',
        createdAt: '2024-01-14T14:20:00Z',
        category: 'personal'
      }
    ];
    
    setTimeout(() => {
      setIssues(mockIssues);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const rightAction = (
    <Button
      size="sm"
      onClick={() => navigate("/mobile/issues/new")}
      className="bg-white/20 hover:bg-white/30 text-white"
    >
      <Plus className="h-4 w-4" />
    </Button>
  );

  return (
    <MobileLayout 
      title="My Issues / मेरे टिकट"
      rightAction={rightAction}
    >
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <p className="text-lg">No issues found</p>
              <p className="text-sm">कोई टिकट नहीं मिला</p>
            </div>
            <Button 
              onClick={() => navigate("/mobile/issues/new")}
              className="bg-[#1E40AF] hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Issue / पहला टिकट बनाएं
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue: any) => (
              <Card 
                key={issue.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/mobile/issues/${issue.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {issue.description}
                      </p>
                    </div>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>#{issue.id}</span>
                    <span>{formatDate(issue.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileIssues;
