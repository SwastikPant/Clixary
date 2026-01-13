import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import { MoreVert, Reply } from '@mui/icons-material';
import { commentsService } from '../services/comments';
import { Comment } from '../types';
import { useAppSelector } from '../store/hooks';
import { usersService } from '../services/users';
import { User } from '../types';

interface CommentsSectionProps {
  imageId: number;
}

const CommentItem: React.FC<{
  comment: Comment;
  onReply: (commentId: number) => void;
  onEdit: (commentId: number, text: string) => void;
  onDelete: (commentId: number) => void;
  currentUsername?: string;
  level?: number;
}> = ({ comment, onReply, onEdit, onDelete, currentUsername, level = 0 }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const isOwner = currentUsername === comment.user;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    onEdit(comment.id, editText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(comment.id);
    handleMenuClose();
  };

  return (
    <Box sx={{ mb: 2, ml: level * 4 }}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {comment.user.charAt(0).toUpperCase()}
          </Avatar>

          <Box flex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle2">{comment.user}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.created_at).toLocaleString()}
                </Typography>
              </Box>

              {isOwner && (
                <>
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVert fontSize="small" />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleEdit}>Edit</MenuItem>
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                  </Menu>
                </>
              )}
            </Box>

            {isEditing ? (
              <Box mt={1}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  size="small"
                />
                <Box mt={1} display="flex" gap={1}>
                  <Button size="small" variant="contained" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button size="small" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {comment.text}
                </Typography>
                {level < 2 && (
                  <Button
                    size="small"
                    startIcon={<Reply />}
                    onClick={() => onReply(comment.id)}
                    sx={{ mt: 1 }}
                  >
                    Reply
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUsername={currentUsername}
              level={level + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const CommentsSection: React.FC<CommentsSectionProps> = ({ imageId }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionOptions, setMentionOptions] = useState<User[]>([]);
  const [showMentionOptions, setShowMentionOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [imageId]);

  const loadComments = async () => {
    try {
      const data = await commentsService.getImageComments(imageId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await commentsService.postComment(imageId, newComment, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
      await loadComments();
    } catch (err: any) {
      setError('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCommentChange = async (value: string) => {
    setNewComment(value);

    const match = value.match(/@([a-zA-Z0-9_]{1,})$/);
    if (match) {
      const q = match[1];
      setMentionQuery(q);
      if (q.length >= 1) {
        try {
          const users = await usersService.search(q);
          setMentionOptions(users);
          setShowMentionOptions(true);
        } catch (e) {
          setMentionOptions([]);
          setShowMentionOptions(false);
        }
      } else {
        setMentionOptions([]);
        setShowMentionOptions(false);
      }
    } else {
      setMentionOptions([]);
      setShowMentionOptions(false);
      setMentionQuery('');
    }
  };

  const insertMention = (username: string) => {
    const newText = newComment.replace(/@([a-zA-Z0-9_]{1,})$/, `@${username} `);
    setNewComment(newText);
    setShowMentionOptions(false);
    setMentionOptions([]);
  };

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleEdit = async (commentId: number, text: string) => {
    try {
      await commentsService.editComment(commentId, text);
      await loadComments();
    } catch (err) {
      setError('Failed to edit comment');
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await commentsService.deleteComment(commentId);
      await loadComments();
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comments ({comments.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

     
      <Box mb={3}>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUsername={user?.username}
            />
          ))
        )}
      </Box>

  
      <Paper elevation={2} sx={{ p: 2 }}>
        {replyingTo && (
          <Alert
            severity="info"
            onClose={() => setReplyingTo(null)}
            sx={{ mb: 2 }}
          >
            Replying to comment
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => handleNewCommentChange(e.target.value)}
          variant="outlined"
        />

        {showMentionOptions && mentionOptions.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Paper elevation={3} sx={{ maxHeight: 200, overflow: 'auto' }}>
              {mentionOptions.map((u) => (
                <Box
                  key={u.id}
                  sx={{ p: 1, cursor: 'pointer', '&:hover': { background: '#f5f5f5' } }}
                  onClick={() => insertMention(u.username)}
                >
                  @{u.username}
                </Box>
              ))}
            </Paper>
          </Box>
        )}
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handlePostComment}
            disabled={loading || !newComment.trim()}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CommentsSection;