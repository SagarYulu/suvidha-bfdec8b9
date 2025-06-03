
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { issueService, Issue } from '../services/issueService'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

export function Issues() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await issueService.getIssues()
        setIssues(response.data.issues)
      } catch (error) {
        console.error('Error fetching issues:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div>Loading issues...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Issues</h1>
        <Button asChild>
          <Link to="/new-issue">New Issue</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {issues.map((issue) => (
          <Card key={issue.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link to={`/issues/${issue.id}`} className="hover:underline">
                    <h3 className="font-medium text-lg mb-2">
                      {issue.description.substring(0, 100)}...
                    </h3>
                  </Link>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>By {issue.employee_name}</span>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    {issue.assigned_to_name && (
                      <span>Assigned to {issue.assigned_to_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {issues.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">No issues found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
