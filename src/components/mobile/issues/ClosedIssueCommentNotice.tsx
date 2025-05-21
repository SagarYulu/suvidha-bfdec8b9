
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const ClosedIssueCommentNotice = ({ closedAt }: { closedAt: string }) => {
  return (
    <Card className="mt-4 border-dashed border-muted-foreground">
      <CardContent className="p-4 flex items-center text-muted-foreground">
        <Clock className="h-4 w-4 mr-2" />
        <p className="text-sm">
          This issue was closed {formatDistanceToNow(new Date(closedAt))} ago. No new comments can be added.
        </p>
      </CardContent>
    </Card>
  );
};

export default ClosedIssueCommentNotice;
