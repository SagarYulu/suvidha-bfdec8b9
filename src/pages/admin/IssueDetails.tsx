
import { useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAdminIssue } from "@/hooks/useAdminIssue";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";

// Import the components
import IssueHeader from "@/components/admin/issues/IssueHeader";
import IssueDetailsCard from "@/components/admin/issues/IssueDetailsCard";
import EmployeeInformation from "@/components/admin/issues/EmployeeInformation";
import TicketAssignment from "@/components/admin/issues/TicketAssignment";
import IssueActivity from "@/components/admin/issues/IssueActivity";
import CommentSection from "@/components/admin/issues/CommentSection";
import IssueLoading from "@/components/admin/issues/IssueLoading";
import IssueError from "@/components/admin/issues/IssueError";
import IssueTypeMapping from "@/components/admin/issues/IssueTypeMapping";

const AdminIssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    issue,
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
    handleIssueMapped,
  } = useAdminIssue(id);

  if (isLoading) {
    return <IssueLoading />;
  }

  if (!issue) {
    return <IssueError />;
  }

  // Convert the availableAssignees to the format expected by the TicketAssignment component
  const formattedAssignees = availableAssignees.map(assignee => ({
    value: assignee.id,
    label: assignee.name
  }));

  return (
    <AdminLayout title="Issue Details">
      <div className="space-y-6">
        <IssueHeader issue={issue} />
        
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <IssueDetailsCard
              issue={issue}
              status={status}
              handleStatusChange={handleStatusChange}
              isUpdatingStatus={isUpdatingStatus}
              formatDate={formatDate}
              getIssueTypeLabel={getIssueTypeLabel}
              getIssueSubTypeLabel={getIssueSubTypeLabel}
            />

            {(issue.typeId === "others" || issue.mappedTypeId) && (
              <IssueTypeMapping 
                issue={issue}
                onIssueMapped={handleIssueMapped}
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
              availableAssignees={formattedAssignees}
              currentAssigneeId={currentAssigneeId}
              currentAssigneeName={currentAssigneeName}
              selectedAssigneeId={selectedAssignee}
              isAssigning={isAssigning}
              onAssigneeSelect={setSelectedAssignee}
              onAssign={handleAssignIssue}
            />
            
            <IssueActivity issue={issue} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIssueDetails;
