
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Code, Users, Zap, Target, Heart, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

export function About() {
  const technologies = [
    'React 18', 'TypeScript', 'Tailwind CSS', 'Radix UI',
    'Vite', 'React Router', 'ESLint', 'PostCSS'
  ]

  const features = [
    'Modern React with Hooks and TypeScript',
    'Component-based architecture with reusable UI components',
    'Responsive design with mobile-first approach',
    'Accessible UI components following WCAG guidelines',
    'Modern development tools and workflow',
    'Optimized build process with Vite',
    'Clean, maintainable code structure',
    'Cross-browser compatibility'
  ]

  const stats = [
    { label: 'Components', value: '50+' },
    { label: 'Pages', value: '8' },
    { label: 'Performance Score', value: '100' },
    { label: 'Accessibility Score', value: 'AAA' }
  ]

  const values = [
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Code Quality',
      description: 'We believe in writing clean, maintainable, and well-documented code that stands the test of time.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'User-Centric',
      description: 'Every decision we make is guided by how it will impact the end user experience.'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Performance',
      description: 'Speed and efficiency are not afterthoughts - they are core principles in our development process.'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Accessibility',
      description: 'We build inclusive applications that work for everyone, regardless of their abilities.'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">About This Project</h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
          A comprehensive demonstration of modern frontend development practices, 
          showcasing React, TypeScript, and contemporary web technologies in action.
        </p>
      </div>

      {/* Stats Section */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Project Overview */}
      <section className="grid lg:grid-cols-2 gap-12 mb-16">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Project Overview
            </CardTitle>
            <CardDescription>
              What makes this application special
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              This modern frontend application serves as a comprehensive showcase of contemporary 
              web development practices. Built with React 18 and TypeScript, it demonstrates 
              how to create scalable, maintainable, and performant web applications.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The project emphasizes developer experience through modern tooling, clean 
              architecture, and best practices while maintaining a focus on user experience 
              and accessibility.
            </p>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Key Features
            </CardTitle>
            <CardDescription>
              What you'll find in this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Technologies */}
      <section className="mb-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Technologies & Tools</CardTitle>
            <CardDescription className="text-lg">
              Modern stack powering this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center">
              {technologies.map((tech) => (
                <Badge key={tech} variant="outline" className="text-sm py-2 px-4">
                  {tech}
                </Badge>
              ))}
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div>
                <h3 className="text-xl font-semibold mb-4">Frontend Technologies</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>React 18:</strong> Latest React with concurrent features</li>
                  <li>• <strong>TypeScript:</strong> Type-safe JavaScript development</li>
                  <li>• <strong>Tailwind CSS:</strong> Utility-first CSS framework</li>
                  <li>• <strong>Radix UI:</strong> Accessible component primitives</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Development Tools</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Vite:</strong> Fast build tool and dev server</li>
                  <li>• <strong>ESLint:</strong> Code quality and consistency</li>
                  <li>• <strong>PostCSS:</strong> CSS processing and optimization</li>
                  <li>• <strong>React Router:</strong> Client-side routing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Values */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Development Values</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The principles that guide our approach to building exceptional web applications.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <CardTitle className="text-xl">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {value.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Application Architecture</CardTitle>
            <CardDescription className="text-center text-lg">
              How this application is structured and organized
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">UI</span>
                </div>
                <h3 className="font-semibold mb-2">Presentation Layer</h3>
                <p className="text-sm text-muted-foreground">
                  React components, pages, and UI elements built with Radix UI and Tailwind CSS.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">⚡</span>
                </div>
                <h3 className="font-semibold mb-2">Business Logic</h3>
                <p className="text-sm text-muted-foreground">
                  React hooks, context providers, and utility functions for application state and logic.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">🔧</span>
                </div>
                <h3 className="font-semibold mb-2">Build & Tooling</h3>
                <p className="text-sm text-muted-foreground">
                  Vite for building, ESLint for code quality, and TypeScript for type safety.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Interested in Learning More?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Explore our blog for detailed tutorials and insights into modern web development,
            or get in touch to discuss your next project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/blog">Read Our Blog</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Get In Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
