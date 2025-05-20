
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
import { Clock, Search, User as UserIcon, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatShortDate } from "@/utils/formatUtils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TicketFeedbackButton from "@/components/mobile/issues/TicketFeedbackButton";

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

        // First, try direct ID match
        let { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('id', authState.user.id)
          .maybeSingle();

        // If no match, try with user_id field
        if (!employeeData && !employeeError) {
          const { data: userIdMatch, error: userIdError } = await supabase
            .from('employees')
            .select('*')
            .eq('user_id', authState.user.id)
            .maybeSingle();
            
          if (userIdMatch) employeeData = userIdMatch;
          if (userIdError) employeeError = userIdError;
        }
        
        if (employeeError) {
          console.error("Error fetching employee details:", employeeError);
          setLoadError("Could not load employee details. Please try again.");
          return;
        }
        
        if (employeeData) {
          // Map the employee data to User type
          const userData: User = {
            id: String(employeeData.id),
            name: employeeData.name,
            email: employeeData.email,
            phone: employeeData.phone || "",
            employeeId: employeeData.emp_id,
            city: employeeData.city || "",
            cluster: employeeData.cluster || "",
            manager: employeeData.manager || "",
            role: employeeData.role || "",
            password: employeeData.password,
            dateOfJoining: employeeData.date_of_joining || "",
            bloodGroup: employeeData.blood_group || "",
            dateOfBirth: employeeData.date_of_birth || "",
            accountNumber: employeeData.account_number || "",
            ifscCode: employeeData.ifsc_code || "",
            userId: employeeData.user_id || "",
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
              
              {/* My Tickets Button */}
              <Button 
                onClick={() => navigate("/mobile/my-tickets")}
                className="bg-yulu-dashboard-blue hover:bg-yulu-dashboard-blue-dark text-white flex items-center gap-2"
                size="sm"
              >
                <span>My Tickets / मेरे टिकट</span>
              </Button>
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
      </div>
    </MobileLayout>
  );
};

export default MobileIssues;
