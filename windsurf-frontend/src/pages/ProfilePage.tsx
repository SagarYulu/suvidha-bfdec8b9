
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

const ProfilePage = () => {
  const [name, setName] = useState('John Doe')
  const [email, setEmail] = useState('john.doe@example.com')
  const [phone, setPhone] = useState('+1234567890')

  const handleSave = () => {
    toast({
      title: "Success",
      description: "Profile updated successfully"
    })
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default ProfilePage
