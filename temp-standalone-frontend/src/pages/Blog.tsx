
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Calendar, Clock, User, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function Blog() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const posts = [
    {
      id: 1,
      title: 'Building Modern React Applications with TypeScript',
      excerpt: 'Learn how to leverage TypeScript in React applications for better development experience and code quality.',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      category: 'React',
      readTime: '8 min read',
      tags: ['React', 'TypeScript', 'Frontend'],
      featured: true
    },
    {
      id: 2,
      title: 'Mastering Tailwind CSS: Advanced Techniques',
      excerpt: 'Discover advanced Tailwind CSS techniques and patterns for creating beautiful, maintainable user interfaces.',
      author: 'Mike Chen',
      date: '2024-01-12',
      category: 'CSS',
      readTime: '6 min read',
      tags: ['CSS', 'Tailwind', 'Design'],
      featured: false
    },
    {
      id: 3,
      title: 'Performance Optimization in Modern Web Apps',
      excerpt: 'Essential strategies for optimizing React applications and improving user experience through better performance.',
      author: 'Alex Rodriguez',
      date: '2024-01-10',
      category: 'Performance',
      readTime: '10 min read',
      tags: ['Performance', 'React', 'Optimization'],
      featured: true
    },
    {
      id: 4,
      title: 'Accessibility Best Practices for Web Developers',
      excerpt: 'A comprehensive guide to building accessible web applications that work for everyone.',
      author: 'Emily Davis',
      date: '2024-01-08',
      category: 'Accessibility',
      readTime: '7 min read',
      tags: ['Accessibility', 'UX', 'Web Standards'],
      featured: false
    },
    {
      id: 5,
      title: 'State Management Patterns in React',
      excerpt: 'Exploring different state management solutions and when to use each approach in React applications.',
      author: 'David Wilson',
      date: '2024-01-05',
      category: 'React',
      readTime: '12 min read',
      tags: ['React', 'State Management', 'Architecture'],
      featured: false
    },
    {
      id: 6,
      title: 'Modern CSS Grid and Flexbox Layouts',
      excerpt: 'Master modern layout techniques with CSS Grid and Flexbox to create responsive, flexible designs.',
      author: 'Lisa Thompson',
      date: '2024-01-03',
      category: 'CSS',
      readTime: '9 min read',
      tags: ['CSS', 'Layout', 'Grid', 'Flexbox'],
      featured: false
    }
  ]

  const categories = ['All', 'React', 'CSS', 'Performance', 'Accessibility']

  const getPostsByCategory = (category: string) => {
    let filteredPosts = category === 'All' ? posts : posts.filter(post => post.category === category)
    
    if (searchTerm) {
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    return filteredPosts
  }

  const featuredPosts = posts.filter(post => post.featured)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-6">Development Blog</h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Insights, tutorials, and best practices for modern web development. 
          Stay updated with the latest trends and techniques.
        </p>
      </div>

      {/* Featured Posts */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {featuredPosts.slice(0, 2).map((post) => (
            <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-black/20" />
                <Badge className="absolute top-4 left-4 bg-white text-black">
                  Featured
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <Badge variant="outline">{post.category}</Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    <span className="mr-4">{post.author}</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Search and Filter */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </section>

      {/* All Posts */}
      <section>
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getPostsByCategory(category).map((post) => (
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 flex flex-col">
                    <CardHeader className="flex-1">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <Badge variant="outline">{post.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                        {post.excerpt}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          <span className="mr-3">{post.author}</span>
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {getPostsByCategory(category).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles found matching your criteria.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 mt-16">
        <div className="bg-muted rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter and get the latest articles delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input placeholder="Enter your email" type="email" className="flex-1" />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
