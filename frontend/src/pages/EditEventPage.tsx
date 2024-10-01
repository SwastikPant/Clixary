import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save, Delete } from '@mui/icons-material';
import { eventsService } from '../services/events';
import { useAppSelector } from '../store/hooks';

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEvent(parseInt(id));
    }
  }, [id]);

  const loadEvent = async (eventId: number) => {
    try {
      const event = await eventsService.getById(eventId);
      
      setFormData({
        name: event.name,
        start_date: event.start_date.slice(0, 16), // Format for datetime-local
        end_date: event.end_date.slice(0, 16),
        description: event.description,
        is_public: event.is_public,
      });
    } catch (err) {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

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
    if (!id) return;
    
    setError(null);
    setSaving(true);

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

      await eventsService.update(parseInt(id), formDataToSend);
      navigate(`/events/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!window.confirm('Are you sure you want to delete this event? All photos will remain but won\'t be associated with this event.')) {
      return;
    }

    setDeleting(true);
    try {
      await eventsService.delete(parseInt(id));
      alert('Event deleted successfully');
      navigate('/events');
    } catch (err: any) {
      alert('Failed to delete event');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/events/${id}`)}
        sx={{ mb: 2 }}
      >
        Back to Event
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Event
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
              Change Cover Photo
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
              disabled={saving}
              fullWidth
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? 'Deleting...' : 'Delete Event'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditEventPage;