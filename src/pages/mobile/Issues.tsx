
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import { getIssuesByUserId } from "@/services/issues/issueCore";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";
import { getUserById } from "@/services/userService";
import { Issue, User } from "@/types";
import { Card } from "@/components/ui/card";
import { Clock, Search, User as UserIcon, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatShortDate } from "@/utils/formatUtils";
import MobileSentiment from "./Sentiment";
import { useNavigate as useRouterNavigate } from 'react-router-dom';

const MobileIssues = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [employeeDetails, setEmployeeDetails] = useState<User | null>(null);
  const [isSentimentDialogOpen, setSentimentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (authState.user?.id) {
        try {
          console.log("Fetching employee details for:", authState.user.id);
          const userData = await getUserById(authState.user.id);
          if (userData) {
            console.log("Employee details found:", userData);
            setEmployeeDetails(userData);
          } else {
            console.warn("No employee details found for user ID:", authState.user.id);
          }
        } catch (error) {
          console.error("Error fetching employee details:", error);
        }
      }
    };

    fetchEmployeeDetails();
  }, [authState.user?.id]);

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      if (authState.user?.id) {
        try {
          const userIssues = await getIssuesByUserId(authState.user.id);
          setIssues(userIssues);
          setFilteredIssues(userIssues);
        } catch (error) {
          console.error("Error fetching tickets:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchIssues();
  }, [authState.user?.id]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = issues.filter((issue) => {
        const typeLabel = getIssueTypeLabel(issue.typeId).toLowerCase();
        const subTypeLabel = getIssueSubTypeLabel(issue.typeId, issue.subTypeId).toLowerCase();
        const description = issue.description.toLowerCase();
        const term = searchTerm.toLowerCase();

        return (
          typeLabel.includes(term) || 
          subTypeLabel.includes(term) || 
          description.includes(term)
        );
      });
      
      setFilteredIssues(filtered);
    } else {
      setFilteredIssues(issues);
    }
  }, [searchTerm, issues]);

  return (
    <MobileLayout title="Home">
      <div className="space-y-4 pb-16">
        {/* Employee Details Card */}
        {employeeDetails && (
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <UserIcon className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-medium">Employee Details</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <p className="text-gray-500 text-sm">Name</p>
                <p>{employeeDetails.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Employee ID</p>
                <p>{employeeDetails.employeeId}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="truncate">{employeeDetails.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p>{employeeDetails.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">City</p>
                <p>{employeeDetails.city || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Cluster</p>
                <p>{employeeDetails.cluster || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Role</p>
                <p>{employeeDetails.role || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Reporting Manager</p>
                <p>{employeeDetails.manager || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Date of Joining</p>
                <p>{employeeDetails.dateOfJoining ? formatShortDate(employeeDetails.dateOfJoining) : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Date of Birth</p>
                <p>{employeeDetails.dateOfBirth ? formatShortDate(employeeDetails.dateOfBirth) : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Blood Group</p>
                <p>{employeeDetails.bloodGroup || "N/A"}</p>
              </div>
            </div>
            
            {/* Financial Details in a separate section */}
            {(employeeDetails.accountNumber || employeeDetails.ifscCode) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Financial Details
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-gray-500 text-sm">Account Number</p>
                    <p>{employeeDetails.accountNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">IFSC Code</p>
                    <p>{employeeDetails.ifscCode || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tickets Section */}
        <div>
          <h2 className="text-lg font-medium mb-3">My Tickets</h2>
          
          <div className="relative mb-4 bg-white rounded-lg">
            <div className="flex items-center px-3">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 rounded-lg"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00CEDE]"></div>
            </div>
          ) : filteredIssues.length > 0 ? (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/mobile/issues/${issue.id}`)}
                  className="bg-white rounded-lg p-4 active:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">
                      {getIssueTypeLabel(issue.typeId)}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${issue.status === "open" ? "bg-red-500 text-white" : 
                                     issue.status === "in_progress" ? "bg-yellow-500 text-white" : 
                                     "bg-green-500 text-white"}`}>
                      {issue.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                  </p>
                  <p className="text-sm mb-3 line-clamp-2">{issue.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatShortDate(issue.createdAt)}
                    </span>
                    <span className="flex items-center">
                      {issue.comments.length} comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg p-4">
              <h3 className="mt-2 text-lg font-medium">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "No tickets match your search" : "You haven't raised any tickets yet"}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/mobile/issues/new")}
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[#00CEDE] hover:bg-[#00B8C8]"
                >
                  Raise a new ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sentiment Dialog */}
      <MobileSentiment 
        isOpen={isSentimentDialogOpen}
        onClose={() => setSentimentDialogOpen(false)}
      />
    </MobileLayout>
  );
};

export default MobileIssues;
