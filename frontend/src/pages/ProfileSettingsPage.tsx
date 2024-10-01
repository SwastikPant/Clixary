import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { ArrowBack, Save, Person } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { profileService } from '../services/profile';
import { loadUser } from '../store/authSlice';

const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    bio: '',
    batch: '',
    department: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      setFormData({
        bio: data.bio || '',
        batch: data.batch || '',
        department: data.department || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await profileService.updateProfile(formData);
      setSuccess(true);
      
      dispatch(loadUser());
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/events')}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Person sx={{ fontSize: 40 }} color="primary" />
          <Typography variant="h4">Profile Settings</Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              Username
            </Typography>
            <Typography variant="body1">{user?.username}</Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{user?.email}</Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              Role
            </Typography>
            <Box mt={1}>
              <Chip label={user?.role} color="primary" />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Profile Details
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Bio"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            margin="normal"
            placeholder="Tell us about yourself..."
          />

          <TextField
            fullWidth
            label="Batch"
            value={formData.batch}
            onChange={(e) => handleChange('batch', e.target.value)}
            margin="normal"
            placeholder="e.g., 2024"
          />

          <TextField
            fullWidth
            label="Department"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            margin="normal"
            placeholder="e.g., Computer Science"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={saving}
              fullWidth
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/events')}
              disabled={saving}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileSettingsPage;