
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, AlertCircle, MessageSquare } from "lucide-react";

const IssueDetailsModal = ({ issue, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(issue);
  const [newComment, setNewComment] = useState('');

  // Mock comments for demo
  const [comments] = useState([
    {
      id: 1,
      author: 'John Doe',
      content: 'I\'ve started investigating this issue.',
      timestamp: '2024-01-15 10:30 AM'
    },
    {
      id: 2,
      author: 'Jane Smith',
      content: 'Found the root cause. Working on a fix.',
      timestamp: '2024-01-15 2:15 PM'
    }
  ]);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(issue);
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Issue Details - #{issue.id}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{issue.title}</h2>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(isEditing ? editData.status : issue.status)}>
                    {(isEditing ? editData.status : issue.status).replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(isEditing ? editData.priority : issue.priority)}>
                    {isEditing ? editData.priority : issue.priority}
                  </Badge>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">{issue.description}</p>
            </div>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
                
                {/* Add Comment */}
                <div className="pt-4 border-t">
                  <Label htmlFor="newComment">Add Comment</Label>
                  <Textarea
                    id="newComment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="mt-2"
                  />
                  <Button className="mt-2" size="sm">
                    Add Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="font-medium">{issue.createdAt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Assigned To</div>
                    <div className="font-medium">{issue.assignedTo}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Employee ID</div>
                    <div className="font-medium">{issue.employeeUuid}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label>Status</Label>
                      <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select value={editData.priority} onValueChange={(value) => setEditData({...editData, priority: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Assign To</Label>
                      <Select value={editData.assignedTo} onValueChange={(value) => setEditData({...editData, assignedTo: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="John Doe">John Doe</SelectItem>
                          <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                          <SelectItem value="Bob Wilson">Bob Wilson</SelectItem>
                          <SelectItem value="Alice Brown">Alice Brown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSave} size="sm">Save</Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
                    </div>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    Edit Issue
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailsModal;
