'use client'

import { useState, useEffect } from 'react'
import Icon from './Icon'
import { useToast } from './Toast'

interface Comment {
  id: string
  content: string
  author: string
  timestamp: string
  replies: Reply[]
}

interface Reply {
  id: string
  content: string
  author: string
  timestamp: string
  parentId: string
}

interface CommentSidebarProps {
  isOpen: boolean
  onClose: () => void
  riskId: string
  onCommentCountChange?: (count: number) => void
}

export default function CommentSidebar({ isOpen, onClose, riskId, onCommentCountChange }: CommentSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  // Load comments when sidebar opens
  useEffect(() => {
    if (isOpen && riskId) {
      loadComments()
    }
  }, [isOpen, riskId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/risks/${riskId}/comments`)
      const result = await response.json()
      
      if (result.success) {
        // Transform the data to match our interface
        const transformedComments: Comment[] = result.data.map((comment: any) => ({
          id: comment._id || comment.id,
          content: comment.content,
          author: comment.author,
          timestamp: comment.timestamp,
          replies: (comment.replies || []).map((reply: any, index: number) => ({
            id: `${comment._id || comment.id}-${index}`,
            content: reply.content,
            author: reply.author,
            timestamp: reply.timestamp,
            parentId: comment._id || comment.id
          }))
        }))
        setComments(transformedComments)
        // Notify parent component of comment count
        onCommentCountChange?.(transformedComments.length)
      } else {
        // Fallback to mock data if API fails
        const mockComments: Comment[] = [
          {
            id: '1',
            content: 'This risk requires immediate attention due to the high impact on our customer data.',
            author: 'Sarah Johnson',
            timestamp: '2024-01-15T10:30:00Z',
            replies: [
              {
                id: '1-1',
                content: 'I agree. We should prioritize the treatment plan.',
                author: 'Mike Chen',
                timestamp: '2024-01-15T11:00:00Z',
                parentId: '1'
              }
            ]
          },
          {
            id: '2',
            content: 'The current controls seem insufficient for this threat level.',
            author: 'David Wilson',
            timestamp: '2024-01-14T16:45:00Z',
            replies: []
          }
        ]
        setComments(mockComments)
        // Notify parent component of comment count
        onCommentCountChange?.(mockComments.length)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
      showToast({
        type: 'error',
        title: 'Failed to Load Comments',
        message: 'Unable to load comments. Please try again.',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`/api/risks/${riskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      const result = await response.json()
      
      if (result.success) {
        const newCommentObj: Comment = {
          id: result.data._id || Date.now().toString(),
          content: newComment,
          author: result.data.author || 'Current User',
          timestamp: result.data.timestamp,
          replies: result.data.replies || []
        }

        setComments(prev => [newCommentObj, ...prev])
        setNewComment('')
        // Update comment count
        onCommentCountChange?.(comments.length + 1)
        
        showToast({
          type: 'success',
          title: 'Comment Added',
          message: 'Your comment has been added successfully.',
          duration: 3000
        })
      } else {
        throw new Error(result.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      showToast({
        type: 'error',
        title: 'Failed to Add Comment',
        message: 'Unable to add comment. Please try again.',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`/api/risks/${riskId}/comments/${parentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent })
      })

      const result = await response.json()
      
      if (result.success) {
        const newReply: Reply = {
          id: `${parentId}-${Date.now()}`,
          content: replyContent,
          author: result.data.author || 'Current User',
          timestamp: result.data.timestamp,
          parentId
        }

        setComments(prev => prev.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies: [...comment.replies, newReply] }
            : comment
        ))
        
        setReplyContent('')
        setReplyingTo(null)
        
        showToast({
          type: 'success',
          title: 'Reply Added',
          message: 'Your reply has been added successfully.',
          duration: 3000
        })
      } else {
        throw new Error(result.error || 'Failed to add reply')
      }
    } catch (error) {
      console.error('Error adding reply:', error)
      showToast({
        type: 'error',
        title: 'Failed to Add Reply',
        message: 'Unable to add reply. Please try again.',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  return (
    <>
      {/* Backdrop with blur effect only */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Icon name="message-circle" size={20} className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Add Comment Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                disabled={loading}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#4C1D95' }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Icon name="send" size={16} className="mr-2" />
                      Add Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto">
            {loading && comments.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="message-circle" size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No comments yet</p>
                <p className="text-sm text-gray-400 mt-1">Be the first to add a comment</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    {/* Main Comment */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {comment.author.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{comment.author}</p>
                            <p className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 pl-4 border-l-2 border-purple-200">
                        <div className="space-y-2">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                            rows={2}
                            disabled={loading}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent('')
                              }}
                              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddReply(comment.id)}
                              disabled={!replyContent.trim() || loading}
                              className="px-3 py-1 text-xs font-medium text-white rounded transition-colors disabled:opacity-50"
                              style={{ backgroundColor: '#4C1D95' }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="pl-4 border-l-2 border-gray-200">
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {reply.author.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs font-medium text-gray-900">{reply.author}</p>
                                  <p className="text-xs text-gray-500">{formatTimestamp(reply.timestamp)}</p>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 