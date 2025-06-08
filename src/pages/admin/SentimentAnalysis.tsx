
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const SentimentAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentimentAnalysis();
  }, []);

  const fetchSentimentAnalysis = async () => {
    try {
      setLoading(true);
      // Mock data for sentiment analysis
      const mockData = {
        overallSentiment: 'positive',
        sentimentScore: 0.75,
        trends: {
          positive: 68,
          neutral: 22,
          negative: 10
        },
        keyInsights: [
          "Customer satisfaction improved by 15% this month",
          "Response time complaints decreased by 20%",
          "Product quality mentions increased positively"
        ],
        topKeywords: [
          { word: "excellent", sentiment: "positive", count: 45 },
          { word: "fast", sentiment: "positive", count: 38 },
          { word: "helpful", sentiment: "positive", count: 32 },
          { word: "slow", sentiment: "negative", count: 12 },
          { word: "issue", sentiment: "negative", count: 8 }
        ]
      };
      setAnalysis(mockData);
    } catch (error) {
      console.error('Error fetching sentiment analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-5 w-5" />;
      case 'negative': return <AlertTriangle className="h-5 w-5" />;
      default: return <BrainCircuit className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Sentiment Analysis">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Sentiment Analysis">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h1>
          <p className="text-gray-600">AI-powered sentiment analysis of customer feedback</p>
        </div>

        {/* Overall Sentiment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2" />
              Overall Sentiment Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${getSentimentColor(analysis?.overallSentiment)}`}>
                  {getSentimentIcon(analysis?.overallSentiment)}
                </div>
                <div>
                  <div className="text-2xl font-bold capitalize">
                    {analysis?.overallSentiment || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Score: {((analysis?.sentimentScore || 0) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% this week
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Positive Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {analysis?.trends?.positive || 0}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${analysis?.trends?.positive || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Customers expressing satisfaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-600">Neutral Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {analysis?.trends?.neutral || 0}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${analysis?.trends?.neutral || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Neutral or mixed feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Negative Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {analysis?.trends?.negative || 0}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${analysis?.trends?.negative || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Issues requiring attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights and Keywords */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis?.keyInsights?.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis?.topKeywords?.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{keyword.word}</span>
                      <Badge 
                        variant={keyword.sentiment === 'positive' ? 'secondary' : 
                                 keyword.sentiment === 'negative' ? 'destructive' : 'outline'}
                      >
                        {keyword.sentiment}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">{keyword.count} mentions</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SentimentAnalysis;
