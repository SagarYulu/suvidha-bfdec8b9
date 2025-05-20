
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import { getIssuesByUserId } from "@/services/issues/issueCore";
import { getUserById } from "@/services/userService";
import { Issue, User } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Search, User as UserIcon, CreditCard, Ticket } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatShortDate } from "@/utils/formatUtils";
import TicketSlidePanel from "@/components/mobile/issues/TicketSlidePanel";

const MobileIssues = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(true);
  const [employeeDetails, setEmployeeDetails] = useState<User | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        
        // Look for employee by matching either id or user_id field to handle different ID formats
        const { data: employees, error } = await supabase
          .from('employees')
          .select('*')
          .or(`user_id.eq.${authState.user.id},id.eq.${authState.user.id}`);
          
        if (error) {
          console.error("Error fetching employee details:", error);
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
      const tempId = authState.user.id;
      authState.user.id = "";
      setTimeout(() => {
        authState.user.id = tempId;
      }, 100);
    }
  };

  return (
    <MobileLayout title="Home / होम">
      <div className="space-y-4 pb-16">
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
              
              {/* Ticket panel trigger button */}
              {!isLoading && issues.length > 0 && authState.user?.id && (
                <TicketSlidePanel
                  issues={issues}
                  currentUserId={authState.user.id}
                  trigger={
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1 bg-white hover:bg-gray-100 font-medium border-amber-500 text-amber-600 animate-pulse-slow"
                    >
                      <Ticket className="h-4 w-4" />
                      <span className="hidden sm:inline">My Tickets</span>
                      <span className="inline-flex items-center justify-center bg-amber-500 text-white rounded-full h-5 w-5 text-xs">
                        {issues.length}
                      </span>
                    </Button>
                  }
                />
              )}
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

        {/* Recent Activities or Announcements Section */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium mb-3">Recent Updates / हाल के अपडेट</h2>
            
            {/* Additional ticket button in this section */}
            {!isLoading && issues.length > 0 && authState.user?.id && (
              <TicketSlidePanel
                issues={issues}
                currentUserId={authState.user.id}
                trigger={
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1 bg-white hover:bg-gray-100 border-amber-500 text-amber-600"
                  >
                    <Ticket className="h-4 w-4" />
                    <span className="inline-flex items-center justify-center bg-amber-500 text-white rounded-full h-5 w-5 text-xs">
                      {issues.length}
                    </span>
                  </Button>
                }
              />
            )}
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="border-l-4 border-blue-500 pl-3 mb-3">
              <h3 className="font-medium">New Leave Policy / नई छुट्टी नीति</h3>
              <p className="text-sm text-gray-600 mt-1">Please review the updated leave policy for 2025. / कृपया 2025 के लिए अपडेट की गई छुट्टी नीति की समीक्षा करें।</p>
              <p className="text-xs text-gray-500 mt-1">May 15, 2025</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-3">
              <h3 className="font-medium">Salary Credited / वेतन जमा हो गया</h3>
              <p className="text-sm text-gray-600 mt-1">Your salary for May 2025 has been credited. / मई 2025 के लिए आपका वेतन जमा कर दिया गया है।</p>
              <p className="text-xs text-gray-500 mt-1">May 01, 2025</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div>
          <h2 className="text-lg font-medium mb-3">Quick Actions / त्वरित कार्य</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => navigate("/mobile/issues/new")}
              className="bg-yulu-dashboard-blue hover:bg-yulu-dashboard-blue-dark text-white h-auto py-3 flex flex-col items-center"
            >
              <span className="text-base">Raise New Ticket</span>
              <span className="text-xs">नया टिकट बनाएँ</span>
            </Button>
            
            <Button 
              onClick={() => navigate("/mobile/sentiment")}
              className="bg-amber-500 hover:bg-amber-600 text-white h-auto py-3 flex flex-col items-center"
              style={{
                background: "linear-gradient(135deg, #FFF3C4 0%, #F59E0B 100%)",
              }}
            >
              <span className="text-base text-gray-800">Share Feedback</span>
              <span className="text-xs text-gray-800">प्रतिक्रिया साझा करें</span>
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileIssues;
