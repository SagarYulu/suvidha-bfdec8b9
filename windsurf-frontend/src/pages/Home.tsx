
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Yulu Issue Resolution
        </h1>
        <p className="text-lg text-gray-600">
          Manage and track your issues efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit New Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Report a new issue or problem that needs attention.
            </p>
            <Button asChild className="w-full">
              <Link to="/new-issue">Submit Issue</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              View and track all your submitted issues.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link to="/issues">View Issues</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Get an overview of all system activities.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
