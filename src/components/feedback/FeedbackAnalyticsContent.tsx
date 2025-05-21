
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FeedbackStars from "@/components/mobile/issues/FeedbackStars";
import { useFeedbackAnalytics } from "@/hooks/useFeedbackAnalytics";
import { FeedbackFilters } from "@/services/feedbackAnalyticsService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from "recharts";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface FeedbackAnalyticsContentProps {
  view: "overview" | "agent" | "solution";
  filters: FeedbackFilters;
}

// Mood emoji mapping
const emojiMap: Record<number, string> = {
  1: "😠",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "🤩",
};

// Sentiment label mapping
const sentimentLabels: Record<number, string> = {
  1: "Very Unhappy",
  2: "Unhappy",
  3: "Neutral",
  4: "Happy", 
  5: "Very Happy"
};

const FeedbackAnalyticsContent: React.FC<FeedbackAnalyticsContentProps> = ({ view, filters }) => {
  // Use our custom hook to fetch the data
  const { isLoading, overview, resolvers, categories, trends, error } = useFeedbackAnalytics({ 
    filters, 
    view 
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-6">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Error loading feedback data</p>
          </div>
          <p className="text-red-600 mt-2 text-sm">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // If no data
  if (!overview) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No feedback data available for the selected filters.</p>
        </CardContent>
      </Card>
    );
  }

  // Render metrics based on the selected view
  const renderOverviewMetrics = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.averageRating.toFixed(1)}</div>
          <div className="flex items-center mt-1">
            <div className="mr-2">
              {emojiMap[Math.round(overview.averageRating)]}
            </div>
            <div className="text-sm text-gray-600">
              {sentimentLabels[Math.round(overview.averageRating)]}
            </div>
          </div>
          <div className="mt-1">
            <FeedbackStars rating={Math.round(overview.averageRating)} readOnly size={16} />
          </div>
          <div className="flex items-center text-xs mt-2">
            {overview.changePercentage > 0 ? (
              <>
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-600">
                  +{overview.changePercentage.toFixed(1)}% from previous
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="text-red-500 h-4 w-4 mr-1" />
                <span className="text-red-600">
                  {overview.changePercentage.toFixed(1)}% from previous
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Feedback Submission Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.submissionRate.percentage.toFixed(1)}%</div>
          <Progress 
            className="mt-2" 
            value={overview.submissionRate.percentage} 
          />
          <div className="flex items-center text-xs mt-2">
            {overview.submissionRate.changePercentage > 0 ? (
              <>
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-600">
                  +{overview.submissionRate.changePercentage.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="text-red-500 h-4 w-4 mr-1" />
                <span className="text-red-600">
                  {overview.submissionRate.changePercentage.toFixed(1)}%
                </span>
              </>
            )}
            <span className="ml-2 text-muted-foreground">
              {overview.submissionRate.withFeedback} out of {overview.submissionRate.total} tickets
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Mood Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview.ratingDistribution.map((item) => (
              <div key={item.rating} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {emojiMap[item.rating]} {sentimentLabels[item.rating]}
                  </span>
                  <span>{item.count} ({item.percentage.toFixed(1)}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrends = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Feedback Submission Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" domain={[0, 5]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="rating" stroke="#8884d8" name="Avg Rating" />
              <Line yAxisId="right" type="monotone" dataKey="submissions" stroke="#82ca9d" name="Submissions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderResolverLeaderboard = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{view === "agent" ? "Agent Performance" : "Resolver Leaderboard"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Feedback Count</TableHead>
              <TableHead>Very Happy</TableHead>
              <TableHead>Happy</TableHead>
              <TableHead>Neutral</TableHead>
              <TableHead>Unhappy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resolvers.map((resolver) => (
              <TableRow key={resolver.id}>
                <TableCell className="font-medium">{resolver.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {resolver.avgRating.toFixed(1)}
                    <div className="ml-2">
                      <FeedbackStars rating={Math.round(resolver.avgRating)} readOnly size={14} />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={resolver.changePercentage > 0 ? "default" : "destructive"}>
                    {resolver.changePercentage > 0 ? '+' : ''}{resolver.changePercentage.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>{resolver.feedbackCount}</TableCell>
                <TableCell>{resolver.veryHappy}%</TableCell>
                <TableCell>{resolver.happy}%</TableCell>
                <TableCell>{resolver.neutral}%</TableCell>
                <TableCell>{resolver.unhappy}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderCategoryAnalysis = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{view === "solution" ? "Solution Category Analysis" : "Category Analysis"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="veryHappy" name="Very Happy" stackId="a" fill="#22c55e" />
              <Bar dataKey="happy" name="Happy" stackId="a" fill="#84cc16" />
              <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#facc15" />
              <Bar dataKey="unhappy" name="Unhappy" stackId="a" fill="#f97316" />
              <Bar dataKey="veryUnhappy" name="Very Unhappy" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderCategoryTable = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{view === "solution" ? "Solution Category Ratings" : "Category Ratings"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Very Happy</TableHead>
              <TableHead>Happy</TableHead>
              <TableHead>Neutral</TableHead>
              <TableHead>Unhappy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.name}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {category.rating.toFixed(1)}
                    <div className="ml-2">
                      <FeedbackStars rating={Math.round(category.rating)} readOnly size={14} />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={category.changePercentage > 0 ? "default" : "destructive"}>
                    {category.changePercentage > 0 ? '+' : ''}{category.changePercentage.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>{category.veryHappy}%</TableCell>
                <TableCell>{category.happy}%</TableCell>
                <TableCell>{category.neutral}%</TableCell>
                <TableCell>{category.unhappy}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {view === "overview" && (
        <>
          {renderOverviewMetrics()}
          {renderTrends()}
          {renderCategoryAnalysis()}
          {renderResolverLeaderboard()}
        </>
      )}
      
      {view === "agent" && (
        <>
          {renderOverviewMetrics()}
          {renderResolverLeaderboard()}
          {renderTrends()}
        </>
      )}
      
      {view === "solution" && (
        <>
          {renderOverviewMetrics()}
          {renderCategoryTable()}
          {renderCategoryAnalysis()}
          <Card>
            <CardHeader>
              <CardTitle>Resolution Satisfaction vs. Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line dataKey="rating" name="Solution Rating" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FeedbackAnalyticsContent;
