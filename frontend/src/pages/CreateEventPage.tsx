import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { eventsService } from '../services/events';
import { useAppSelector } from '../store/hooks';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    is_public: true,
  });
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('is_public', formData.is_public.toString());
      
      if (coverPhoto) {
        formDataToSend.append('cover_photo', coverPhoto);
      }

      const newEvent = await eventsService.create(formDataToSend);
      navigate(`/events/${newEvent.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (!canCreate) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Only coordinators and admins can create events.
          <br />
          Your current role: <strong>{user?.role}</strong>
        </Alert>
        <Button onClick={() => navigate('/events')} sx={{ mt: 2 }}>
          Back to Events
        </Button>
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
        Back to Events
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Event
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Event Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Start Date"
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            required
            label="End Date"
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            margin="normal"
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <Button variant="outlined" component="label">
              Upload Cover Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {coverPhoto && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {coverPhoto.name}
              </Typography>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_public}
                onChange={(e) => handleChange('is_public', e.target.checked)}
              />
            }
            label="Public Event"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateEventPage;