
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
import IssueTimeline from "@/components/admin/issues/IssueTimeline";
import AssigneeConversation from "@/components/admin/issues/AssigneeConversation";

const AdminIssueDetails = () => {
  const { id } = useParams<{ id: string }>();
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
    auditTrail,
    handleAddPrivateComment,
    isCurrentUserAssignee,
    isCurrentUserAssigner
  } = useAdminIssue(id);

  // Create a wrapper function to handle the Promise<boolean> to Promise<void> conversion
  const handlePrivateMessage = async (message: string): Promise<void> => {
    await handleAddPrivateComment(message);
    return;
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

            {/* Private conversation between assignee and assigner */}
            {issue.assignedTo && (
              <AssigneeConversation
                comments={issue.comments}
                assigneeId={issue.assignedTo}
                assignerId={issue.employeeUuid}
                isAssignee={isCurrentUserAssignee}
                isAssigner={isCurrentUserAssigner}
                commenterNames={commenterNames}
                currentUserId={currentUserId}
                formatDate={formatDate}
                onSendPrivateMessage={handlePrivateMessage}
              />
            )}

            <CommentSection
              issue={issue}
              newComment={newComment}
              setNewComment={setNewComment}
              handleAddComment={handleAddComment}
              isSubmittingComment={isSubmittingComment}
              commenterNames={commenterNames}
              formatDate={formatDate}
              currentUser={currentUserId}
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
            
            <IssueTimeline 
              issue={issue}
              auditTrail={auditTrail}
              commenterNames={commenterNames}
            />
            
            <IssueActivity issue={issue} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIssueDetails;
