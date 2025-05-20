
import { useParams } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
import { useMobileIssue } from "@/hooks/useMobileIssue";
import IssueHeader from "@/components/mobile/issues/IssueHeader";
import CommentSection from "@/components/mobile/issues/CommentSection";
import IssueLoading from "@/components/mobile/issues/IssueLoading";
import IssueError from "@/components/mobile/issues/IssueError";
import ClosedIssueCommentNotice from "@/components/mobile/issues/ClosedIssueCommentNotice";

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
    isReopenable,
    processReopenTicket
  } = useMobileIssue(id);

  if (isLoading) {
    return <IssueLoading />;
  }

  if (errorMessage || !issue) {
    return <IssueError errorMessage={errorMessage} />;
  }

  const isClosedOrResolved = issue.status === "closed" || issue.status === "resolved";
  const bgColor = isClosedOrResolved ? "bg-gray-500" : "bg-yulu-dashboard-blue"; // Using dashboard blue color

  // Create a wrapper function with no parameters that will call the actual function
  const handleReopenWithoutParams = () => {
    return;
  };

  return (
    <MobileLayout 
      title="Issue Details"
      bgColor={bgColor}
    >
      <div className="pb-16">
        <IssueHeader
          issue={issue}
          formatDate={formatDate}
          getIssueTypeLabel={getIssueTypeLabel}
          getIssueSubTypeLabel={getIssueSubTypeLabel}
          getStatusBadgeColor={getStatusBadgeColor}
          isReopenable={isReopenable || false}
          handleReopenTicket={handleReopenWithoutParams}
        />
        
        {isClosedOrResolved ? (
          <>
            <ClosedIssueCommentNotice 
              isReopenable={isReopenable || false}
              onReopen={processReopenTicket}
              ticketId={issue.id}
              resolverUuid={issue.assignedTo}
            />
            <CommentSection
              comments={issue.comments}
              newComment=""
              setNewComment={() => {}}
              handleSubmitComment={() => {}}
              isSubmitting={false}
              commenterNames={commenterNames}
              formatDate={formatDate}
              currentUserId={currentUserId}
              disabled={true}
            />
          </>
        ) : (
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
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileIssueDetails;
