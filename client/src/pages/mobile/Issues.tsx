import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import { getIssuesByUserId } from "@/services/issues/issueCore";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";
import { getUserById } from "@/services/userService";
import { Issue, User } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Search, User as UserIcon, CreditCard, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatShortDate } from "@/utils/formatUtils";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiClient";

import FeedbackDialog from "@/components/mobile/issues/FeedbackDialog";
import { checkFeedbackExists } from "@/services/ticketFeedbackService";

const MobileIssues = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(true);
  const [employeeDetails, setEmployeeDetails] = useState<User | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // State for feedback dialog
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string>("");
  const [ticketFeedbackStatus, setTicketFeedbackStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!authState.user?.id) {
        console.log("No user ID available, cannot fetch employee details");
        setIsEmployeeLoading(false);
        setLoadError("User details not available. Please try logging in again.");
        return;
      }

      try {
        console.log("Fetching employee details for:", authState.user.id);
        setIsEmployeeLoading(true);
        
        // Look for employee by matching the ID from authentication
        const allEmployees = await apiClient.getEmployees() as any[];
        const employees = allEmployees.filter((emp: any) => {
          // Convert both to numbers for comparison since auth ID is number and database ID is number
          const empId = Number(emp.id);
          const authId = Number(authState.user!.id);
          return empId === authId;
        });
        
        if (!employees || employees.length === 0) {
          console.log("No matching employee found");
          setLoadError("Could not load employee details. Please try again.");
          return;
        }
        
        if (employees && employees.length > 0) {
          // Map the employee data to User type
          const userData: User = {
            id: String(employees[0].id),
            name: employees[0].name,
            email: employees[0].email,
            phone: employees[0].phone || "",
            employeeId: employees[0].emp_id,
            city: employees[0].city || "",
            cluster: employees[0].cluster || "",
            manager: employees[0].manager || "",
            role: employees[0].role || "",
            password: employees[0].password,
            dateOfJoining: employees[0].date_of_joining || "",
            bloodGroup: employees[0].blood_group || "",
            dateOfBirth: employees[0].date_of_birth || "",
            accountNumber: employees[0].account_number || "",
            ifscCode: employees[0].ifsc_code || "",
            userId: employees[0].user_id || "",
          };
          
          setEmployeeDetails(userData);
          console.log("Employee details found:", userData);
        } else {
          console.warn("No employee details found for user ID:", authState.user.id);
          setLoadError("Could not find your employee record. Please contact support.");
        }
      } catch (error) {
        console.error("Error fetching employee details:", error);
        setLoadError("Error loading employee details. Please try again.");
      } finally {
        setIsEmployeeLoading(false);
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
          
          // Check feedback status for all closed or resolved tickets
          const closedTickets = userIssues.filter(
            issue => issue.status === "closed" || issue.status === "resolved"
          );
          
          if (closedTickets.length > 0) {
            const feedbackChecks = await Promise.all(
              closedTickets.map(async (issue) => {
                const hasFeedback = await checkFeedbackExists(String(issue.id), String(authState.user?.id || ""));
                return { issueId: String(issue.id), hasFeedback };
              })
            );
            
            const feedbackStatusMap: Record<string, boolean> = {};
            feedbackChecks.forEach(({ issueId, hasFeedback }) => {
              feedbackStatusMap[issueId] = hasFeedback;
            });
            
            setTicketFeedbackStatus(feedbackStatusMap);
          }
        } catch (error) {
          console.error("Error fetching tickets:", error);
          setLoadError("Error loading your tickets. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no user ID is available, still stop loading
        setIsLoading(false);
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

  const handleRetry = () => {
    setLoadError(null);
    setIsEmployeeLoading(true);
    
    // Show a toast to indicate retry is happening
    toast({
      title: "Retrying...",
      description: "Attempting to fetch your details again.",
    });
    
    // Force refetch by causing the useEffect to run again
    if (authState.user?.id) {
      // We're just triggering the useEffect by updating a dependency it relies on
      if (authState.user) {
        const tempId = authState.user.id;
        authState.user.id = "";
        setTimeout(() => {
          if (authState.user) {
            authState.user.id = tempId;
          }
        }, 100);
      }
    }
  };

  const openFeedbackDialog = (issueId: string) => {
    setSelectedIssueId(issueId);
    setFeedbackDialogOpen(true);
  };

  const handleFeedbackSubmitted = (issueId: string) => {
    // Update the local state to show feedback was submitted
    setTicketFeedbackStatus(prev => ({
      ...prev,
      [issueId]: true
    }));
    setFeedbackDialogOpen(false);
  };

  return (
    <MobileLayout title="Home / होम">
      <div className="space-y-4 pb-20">
        {/* Employee Details Card */}
        {isEmployeeLoading ? (
          <div className="bg-white rounded-lg p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-lg p-4">
            <div className="text-center py-4">
              <p className="text-red-500 mb-3">{loadError}</p>
              <Button 
                onClick={handleRetry}
                className="bg-yulu-dashboard-blue hover:bg-yulu-dashboard-blue-dark text-white"
              >
                Retry / पुनः प्रयास करें
              </Button>
            </div>
          </div>
        ) : employeeDetails ? (
          
          <div className="bg-white rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <UserIcon className="h-5 w-5 text-yulu-dashboard-blue" />
                </div>
                <h2 className="text-lg font-medium">Employee Details / कर्मचारी विवरण</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <p className="text-gray-500 text-sm">Name / नाम</p>
                <p>{employeeDetails.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Employee ID / कर्मचारी आईडी</p>
                <p>{employeeDetails.employeeId}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email / ईमेल</p>
                <p className="truncate">{employeeDetails.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone / फोन</p>
                <p>{employeeDetails.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">City / शहर</p>
                <p>{employeeDetails.city || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Cluster / क्लस्टर</p>
                <p>{employeeDetails.cluster || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Role / पद</p>
                <p>{employeeDetails.role || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Reporting Manager / रिपोर्टिंग मैनेजर</p>
                <p>{employeeDetails.manager || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Date of Joining / नियुक्ति तिथि</p>
                <p>{employeeDetails.dateOfJoining ? formatShortDate(employeeDetails.dateOfJoining) : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Date of Birth / जन्म तिथि</p>
                <p>{employeeDetails.dateOfBirth ? formatShortDate(employeeDetails.dateOfBirth) : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Blood Group / रक्त समूह</p>
                <p>{employeeDetails.bloodGroup || "N/A"}</p>
              </div>
            </div>
            
            {/* Financial Details in a separate section */}
            {(employeeDetails.accountNumber || employeeDetails.ifscCode) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Financial Details / वित्तीय विवरण
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-gray-500 text-sm">Account Number / खाता संख्या</p>
                    <p>{employeeDetails.accountNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">IFSC Code / आईएफएससी कोड</p>
                    <p>{employeeDetails.ifscCode || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Tickets Section */}
        <div>
          <h2 className="text-lg font-medium mb-3">My Tickets / मेरे टिकट</h2>
          
          <div className="relative mb-4 bg-white rounded-lg">
            <div className="flex items-center px-3">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tickets... / टिकट खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 rounded-lg"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-dashboard-blue"></div>
            </div>
          ) : loadError ? (
            <div className="text-center py-8 bg-white rounded-lg p-4">
              <p className="text-red-500 mb-2">{loadError}</p>
              <Button
                onClick={handleRetry}
                className="bg-yulu-dashboard-blue hover:bg-yulu-dashboard-blue-dark text-white"
              >
                Retry / पुनः प्रयास करें
              </Button>
            </div>
          ) : filteredIssues.length > 0 ? (
            <div className="space-y-3">
              {filteredIssues.map((issue) => {
                const isClosedOrResolved = issue.status === "closed" || issue.status === "resolved";
                const hasFeedback = ticketFeedbackStatus[issue.id] || false;
                
                return (
                  <div
                    key={issue.id}
                    className="bg-white rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 
                        className="font-medium cursor-pointer"
                        onClick={() => navigate(`/mobile/issues/${issue.id}`)}
                      >
                        {getIssueTypeLabel(issue.typeId)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          issue.status === "open" ? "bg-red-500 text-white" : 
                          issue.status === "in_progress" ? "bg-yellow-500 text-white" : 
                          "bg-green-500 text-white"
                        }`}>
                          {issue.status === "open" ? "Open / खुला" : 
                          issue.status === "in_progress" ? "In progress / प्रगति पर" : 
                          "Closed / बंद"}
                        </span>
                      </div>
                    </div>
                    
                    <p 
                      className="text-sm text-gray-600 mb-1 cursor-pointer"
                      onClick={() => navigate(`/mobile/issues/${issue.id}`)}
                    >
                      {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                    </p>
                    
                    <p 
                      className="text-sm mb-3 line-clamp-2 cursor-pointer"
                      onClick={() => navigate(`/mobile/issues/${issue.id}`)}
                    >
                      {issue.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatShortDate(issue.createdAt)}
                      </span>
                      
                      <span className="flex items-center">
                        {issue.comments ? issue.comments.length : 0} comments / टिप्पणियाँ
                      </span>
                    </div>
                    
                    {/* Feedback Section - Golden Flame Colored and Eye-catching */}
                    {isClosedOrResolved && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
                        {hasFeedback ? (
                          <div className="flex items-center justify-center text-black bg-green-50 py-2 px-3 rounded-md w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span>Feedback Submitted / प्रतिक्रिया दी गई</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full animate-pulse border-2 border-amber-500 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-medium hover:from-amber-600 hover:to-yellow-500 flex items-center justify-center transition-all shadow-md"
                            onClick={() => openFeedbackDialog(String(issue.id))}
                          >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            <span className="font-bold">Share Feedback / अपनी प्रतिक्रिया साझा करें</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg p-4">
              <h3 className="mt-2 text-lg font-medium">No tickets found / कोई टिकट नहीं मिला</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "No tickets match your search / आपकी खोज से मेल खाने वाला कोई टिकट नहीं" : "You haven't raised any tickets yet / आपने अभी तक कोई टिकट नहीं बनाया है"}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/mobile/issues/new")}
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-yulu-dashboard-blue hover:bg-yulu-dashboard-blue-dark"
                >
                  Raise a new ticket / नया टिकट बनाएँ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Feedback Dialog */}
      <FeedbackDialog
        isOpen={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        issueId={selectedIssueId}
        employeeUuid={authState.user?.id || ""}
        onFeedbackSubmitted={() => handleFeedbackSubmitted(selectedIssueId)}
      />
    </MobileLayout>
  );
};

export default MobileIssues;
