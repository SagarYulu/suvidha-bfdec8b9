
import { useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAdminIssue } from "@/hooks/useAdminIssue";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";

// Import the components
import IssueHeader from "@/components/admin/issues/IssueHeader";
import IssueDetailsCard from "@/components/admin/issues/IssueDetailsCard";
import EmployeeInformation from "@/components/admin/issues/EmployeeInformation";
import TicketAssignment from "@/components/admin/issues/TicketAssignment";
import IssueActivity from "@/components/admin/issues/IssueActivity";
import CommentSection from "@/components/admin/issues/CommentSection";
import IssueLoading from "@/components/admin/issues/IssueLoading";
import IssueError from "@/components/admin/issues/IssueError";
import IssueMappingSection from "@/components/admin/issues/IssueMappingSection";
import InternalCommentSection from "@/components/admin/issues/InternalCommentSection";
import EscalationPanel from "@/components/admin/issues/EscalationPanel";
import { useRBAC } from "@/contexts/RBACContext";

const AdminIssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useRBAC();
  
  const {
    issue,
    setIssue,
    employee,
    isLoading,
    newComment,
    setNewComment,
    isSubmittingComment,
    status,
    isUpdatingStatus,
    commenterNames,
    availableAssignees,
    currentAssigneeId,
    currentAssigneeName,
    isAssigning,
    selectedAssignee,
    setSelectedAssignee,
    handleAssignIssue,
    handleStatusChange,
    handleAddComment,
    formatDate,
    currentUserId,
    
    // Internal comments properties and functions
    internalComments,
    newInternalComment,
    setNewInternalComment,
    isSubmittingInternalComment,
    internalCommenterNames,
    isLoadingInternalComments,
    handleAddInternalComment,
    canViewInternalComments,
    canAddInternalComments,
  } = useAdminIssue(id);

  // Check if current user can reply to the employee (only HR Admin or Super Admin)
  const canReplyToEmployee = hasPermission("manage:issues") && (
    hasPermission("create:dashboardUser") || // HR Admin permission
    hasPermission("manage:users") // Super Admin permission
  );

  const handleEscalationChange = () => {
    // Refresh issue data when escalation status changes
    setIssue(prev => prev ? { ...prev } : null);
  };

  if (isLoading) {
    return <IssueLoading />;
  }

  if (!issue) {
    return <IssueError />;
  }

  return (
    <AdminLayout title="Issue Details">
      <div className="space-y-6">
        <IssueHeader issue={issue} />
        
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Add Issue Mapping Section at the top if issue type is "others" */}
            {issue.typeId === "others" && (
              <IssueMappingSection 
                issue={issue} 
                currentUserId={currentUserId} 
                onIssueUpdated={setIssue} 
              />
            )}

            <IssueDetailsCard
              issue={issue}
              status={status}
              handleStatusChange={handleStatusChange}
              isUpdatingStatus={isUpdatingStatus}
              formatDate={formatDate}
              getIssueTypeLabel={getIssueTypeLabel}
              getIssueSubTypeLabel={getIssueSubTypeLabel}
            />
            
            {/* Add Internal Comment Section */}
            <InternalCommentSection
              issueId={issue.id}
              internalComments={internalComments}
              newInternalComment={newInternalComment}
              setNewInternalComment={setNewInternalComment}
              handleAddInternalComment={handleAddInternalComment}
              isSubmittingInternalComment={isSubmittingInternalComment}
              commentersNames={internalCommenterNames}
              formatDate={formatDate}
              currentUserId={currentUserId}
              canViewInternalComments={canViewInternalComments}
              canAddInternalComments={canAddInternalComments}
              isLoading={isLoadingInternalComments}
            />

            <CommentSection
              issue={issue}
              newComment={newComment}
              setNewComment={setNewComment}
              handleAddComment={handleAddComment}
              isSubmittingComment={isSubmittingComment}
              commenterNames={commenterNames}
              formatDate={formatDate}
              currentUser={currentUserId}
              canReplyToEmployee={canReplyToEmployee}
            />
          </div>
          
          <div className="space-y-6">
            <EmployeeInformation employee={employee} />
            
            <TicketAssignment 
              availableAssignees={availableAssignees}
              currentAssigneeId={currentAssigneeId}
              currentAssigneeName={currentAssigneeName}
              selectedAssigneeId={selectedAssignee}
              isAssigning={isAssigning}
              onAssigneeSelect={setSelectedAssignee}
              onAssign={handleAssignIssue}
            />

            {/* Add Escalation Panel */}
            <EscalationPanel
              issueId={issue.id}
              currentStatus={issue.status}
              currentLevel={issue.escalation_level || 0}
              escalatedAt={issue.escalated_at}
              priority={issue.priority}
              createdAt={issue.createdAt}
              onEscalationChange={handleEscalationChange}
            />
            
            <IssueActivity issue={issue} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIssueDetails;
