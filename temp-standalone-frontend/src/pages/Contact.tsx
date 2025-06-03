
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin, Send, Github, Twitter, Linkedin, MessageSquare } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We\'ll get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      description: 'Send us an email anytime',
      value: 'hello@modernapp.com',
      action: 'mailto:hello@modernapp.com'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone',
      description: 'Call us during business hours',
      value: '+1 (555) 123-4567',
      action: 'tel:+15551234567'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Office',
      description: 'Visit our headquarters',
      value: 'San Francisco, CA',
      action: '#'
    }
  ]

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#', color: 'text-gray-600' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'text-blue-500' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'text-blue-700' },
    { name: 'Discord', icon: MessageSquare, href: '#', color: 'text-indigo-500' }
  ]

  const faqs = [
    {
      question: 'How can I contribute to this project?',
      answer: 'We welcome contributions! Check out our GitHub repository for guidelines on how to get started.'
    },
    {
      question: 'Do you offer consulting services?',
      answer: 'Yes, we provide consulting services for React and modern web development projects.'
    },
    {
      question: 'Can I use this code in my own project?',
      answer: 'Absolutely! This project is open source and available for use in your own applications.'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">Get In Touch</h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Have questions about our project? Want to collaborate? We'd love to hear from you.
          Reach out through any of the channels below.
        </p>
      </div>

      {/* Contact Methods */}
      <section className="grid md:grid-cols-3 gap-6 mb-16">
        {contactMethods.map((method, index) => (
          <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <div className="mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                {method.icon}
              </div>
              <CardTitle className="text-xl">{method.title}</CardTitle>
              <CardDescription>{method.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href={method.action}
                className="text-primary font-medium hover:underline"
              >
                {method.value}
              </a>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Contact Form and Info */}
      <section className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Send us a Message
            </CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What's this about?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us more about your inquiry..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <Button type="submit" className="w-full" size="lg">
                Send Message
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="space-y-8">
          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Connect With Us</CardTitle>
              <CardDescription>
                Follow us on social media for updates and insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <social.icon className={`h-5 w-5 ${social.color}`} />
                    <span className="font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Email inquiries</span>
                <Badge variant="secondary">24 hours</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Technical support</span>
                <Badge variant="secondary">48 hours</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">General questions</span>
                <Badge variant="secondary">24 hours</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional CTA */}
      <section className="text-center py-16">
        <div className="bg-muted rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Prefer Real-time Chat?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join our community Discord server for real-time discussions and immediate help 
            from our team and community members.
          </p>
          <Button size="lg">
            <MessageSquare className="mr-2 h-5 w-5" />
            Join Discord Community
          </Button>
        </div>
      </section>
    </div>
  )
}
