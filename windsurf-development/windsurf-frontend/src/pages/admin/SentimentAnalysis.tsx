
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SentimentAnalysis = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Sentiment Analysis</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Sentiment analysis results will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentAnalysis;
