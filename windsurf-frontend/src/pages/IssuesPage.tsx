
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const IssuesPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Issues</h2>
            <p className="text-muted-foreground">
              Manage and track all grievance issues
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Issue
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>
              A list of recent grievance issues submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No issues found. Create your first issue to get started.
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default IssuesPage
