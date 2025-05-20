
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import StatsCard from "@/components/admin/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { getIssueStats } from "@/services/issues/issueStatsService";
import { getUsers } from "@/services/userService";
import { 
  Users, Settings, BarChart3, MessageSquare, ClipboardList, 
  Clock, CheckCircle, AlertTriangle 
} from "lucide-react";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);

  const { data: issueStats, isLoading: isLoadingIssueStats } = useQuery({
    queryKey: ['issueStats'],
    queryFn: getIssueStats
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  useEffect(() => {
    if (users) {
      setTotalUsers(users.length);
    }
  }, [users]);

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users"
          value={totalUsers}
          icon={<Users className="h-6 w-6" />}
          isLoading={isLoadingUsers}
          description="Total number of registered users"
        />
        
        <StatsCard
          title="Total Issues"
          value={issueStats?.totalIssues || 0}
          icon={<ClipboardList className="h-6 w-6" />}
          isLoading={isLoadingIssueStats}
          description="All reported issues"
        />
        
        <StatsCard
          title="Open Issues"
          value={issueStats?.openIssues || 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          isLoading={isLoadingIssueStats}
          description="Issues waiting for resolution"
        />
        
        <StatsCard
          title="First Response Time"
          value={`${issueStats?.avgFirstResponseTime || 0} h`}
          icon={<Clock className="h-6 w-6" />}
          isLoading={isLoadingIssueStats}
          description="Average time to first response"
        />
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Quick Links</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickLinkCard 
          title="Manage Users" 
          description="Add, edit, or remove user accounts"
          icon={<Users className="h-10 w-10 text-blue-500" />}
          link="/admin/users"
        />
        
        <QuickLinkCard 
          title="Issue Management" 
          description="View and manage all reported issues"
          icon={<ClipboardList className="h-10 w-10 text-green-500" />}
          link="/admin/issues"
        />
        
        <QuickLinkCard 
          title="Analytics" 
          description="View reports and statistics"
          icon={<BarChart3 className="h-10 w-10 text-purple-500" />}
          link="/admin/analytics"
        />
        
        <QuickLinkCard 
          title="Assigned Issues" 
          description="Issues assigned to you"
          icon={<CheckCircle className="h-10 w-10 text-amber-500" />}
          link="/admin/assigned-issues"
        />
        
        <QuickLinkCard 
          title="Settings" 
          description="Configure system settings"
          icon={<Settings className="h-10 w-10 text-gray-500" />}
          link="/admin/settings"
        />
        
        {/* Removing the Sentiment Analysis quick link */}
      </div>
    </AdminLayout>
  );
};

interface QuickLinkCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const QuickLinkCard: React.FC<QuickLinkCardProps> = ({ title, description, icon, link }) => {
  return (
    <a 
      href={link}
      className="flex items-start p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </a>
  );
};

export default AdminDashboard;
