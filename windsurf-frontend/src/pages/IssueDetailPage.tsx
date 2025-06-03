
import { useParams } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const IssueDetailPage = () => {
  const { id } = useParams()

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Issue Details</h2>
          <p className="text-muted-foreground">
            Details for issue #{id}
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Issue #{id}</CardTitle>
            <CardDescription>
              Issue details and status information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Issue details will be displayed here.
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default IssueDetailPage
