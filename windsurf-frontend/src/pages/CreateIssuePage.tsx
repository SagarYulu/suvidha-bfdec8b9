
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

const CreateIssuePage = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Issue created successfully"
    })
    
    // Reset form
    setTitle('')
    setDescription('')
    setPriority('medium')
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Issue</h2>
          <p className="text-muted-foreground">
            Submit a new grievance issue for review
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Issue Information</CardTitle>
            <CardDescription>
              Provide details about the issue you want to report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter issue title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">
                  Create Issue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default CreateIssuePage
