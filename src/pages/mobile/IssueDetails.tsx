
import { useParams } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
import { useMobileIssue } from "@/hooks/useMobileIssue";
import IssueHeader from "@/components/mobile/issues/IssueHeader";
import CommentSection from "@/components/mobile/issues/CommentSection";
import IssueLoading from "@/components/mobile/issues/IssueLoading";
import IssueError from "@/components/mobile/issues/IssueError";

const MobileIssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    issue,
    isLoading,
    errorMessage,
    newComment,
    setNewComment,
    isSubmitting,
    commenterNames,
    handleSubmitComment,
    getStatusBadgeColor,
    formatDate,
    currentUserId,
  } = useMobileIssue(id);

  if (isLoading) {
    return <IssueLoading />;
  }

  if (errorMessage || !issue) {
    return <IssueError errorMessage={errorMessage} />;
  }

  return (
    <MobileLayout title="Issue Details">
      <div className="pb-16">
        <IssueHeader
          issue={issue}
          formatDate={formatDate}
          getIssueTypeLabel={getIssueTypeLabel}
          getIssueSubTypeLabel={getIssueSubTypeLabel}
          getStatusBadgeColor={getStatusBadgeColor}
        />

        <CommentSection
          comments={issue.comments}
          newComment={newComment}
          setNewComment={setNewComment}
          handleSubmitComment={handleSubmitComment}
          isSubmitting={isSubmitting}
          commenterNames={commenterNames}
          formatDate={formatDate}
          currentUserId={currentUserId}
        />
      </div>
    </MobileLayout>
  );
};

export default MobileIssueDetails;
