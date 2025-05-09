
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Issue } from "@/types";

interface IssueActivityProps {
  issue: Issue;
  formatDate: (date: string) => string;
}

const IssueActivity = ({ issue, formatDate }: IssueActivityProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{formatDate(issue.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-medium">{formatDate(issue.updatedAt)}</p>
          </div>
          {issue.closedAt && (
            <div>
              <p className="text-sm text-gray-500">Closed</p>
              <p className="font-medium">{formatDate(issue.closedAt)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueActivity;
