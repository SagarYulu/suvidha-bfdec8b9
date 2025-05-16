
import MobileLayout from "@/components/MobileLayout";

interface IssueLoadingProps {
  title?: string;
}

const IssueLoading = ({ title = "Issue Details" }: IssueLoadingProps) => {
  return (
    <MobileLayout title={title}>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-dashboard-blue"></div>
      </div>
    </MobileLayout>
  );
};

export default IssueLoading;
