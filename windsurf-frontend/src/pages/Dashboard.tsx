
import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export function Dashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/dashboard')
        setAnalytics(response.data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.totalIssues}</div>
              </CardContent>
            </Card>
            
            {analytics.issuesByStatus.map((item: any) => (
              <Card key={item.status}>
                <CardHeader>
                  <CardTitle className="capitalize">{item.status.replace('_', ' ')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{item.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.recentIssues.map((issue: any) => (
                  <div key={issue.id} className="border-b pb-2">
                    <div className="font-medium">{issue.description.substring(0, 100)}...</div>
                    <div className="text-sm text-gray-600">
                      By {issue.employee_name} • {issue.status} • {issue.priority}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
