
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Code, Palette, Zap, Shield, Globe, Smartphone } from 'lucide-react'

export function Home() {
  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Modern Development',
      description: 'Built with React 18, TypeScript, and modern ES6+ features for optimal performance.'
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: 'Beautiful Design',
      description: 'Crafted with Tailwind CSS and Radix UI for a consistent, accessible design system.'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Fast Performance',
      description: 'Optimized with Vite bundler for lightning-fast development and production builds.'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Type Safety',
      description: 'Full TypeScript support ensures robust code with compile-time error checking.'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'SEO Friendly',
      description: 'Built with semantic HTML and accessibility best practices for better search rankings.'
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'Mobile First',
      description: 'Responsive design that works perfectly on all devices and screen sizes.'
    }
  ]

  const technologies = [
    'React 18', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Vite', 'ESLint'
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20 animate-fade-in">
        <div className="gradient-bg text-white rounded-3xl p-16 mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Modern Frontend
            <br />
            <span className="text-blue-200">Experience</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            A cutting-edge React application showcasing modern web development practices, 
            beautiful UI components, and seamless user experiences.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-sm py-1 px-3">
                {tech}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/blog">
                Explore Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Why Choose Our Platform?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built with the latest technologies and best practices to deliver exceptional user experiences.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="bg-muted rounded-2xl p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">TypeScript</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">0ms</div>
              <div className="text-muted-foreground">Build Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">A+</div>
              <div className="text-muted-foreground">Performance</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of developers who are already building amazing applications with our modern frontend stack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/contact">
                Start Building Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/blog">View Examples</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
