import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
  Chip,
} from '@mui/material';
import { ArrowBack, CalendarToday, CameraAlt, CloudUpload } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEventById, clearCurrentEvent } from '../store/eventsSlice';
import SearchFilter, { SearchFilters } from '../components/SearchFilter';
import { imagesService } from '../services/images';
import { Image } from '../types';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentEvent, loading, error } = useAppSelector((state) => state.events);
  

  const [displayedImages, setDisplayedImages] = useState<Image[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const { user } = useAppSelector((state) => state.auth);

  const canEdit = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(parseInt(id)));
    }
    return () => {
      dispatch(clearCurrentEvent());
    };
  }, [id, dispatch]);


  useEffect(() => {
    if (currentEvent?.images) {
      setDisplayedImages(currentEvent.images);
    }
  }, [currentEvent]);

  const handleSearch = async (filters: SearchFilters) => {
    if (!id) return;
    
    setLoadingImages(true);
    try {
      const params = {
        ...filters,
        event: id,
      };
      const data = await imagesService.getAll(params);
      setDisplayedImages(data);
    } catch (err) {
      console.error('Failed to filter images:', err);
    } finally {
      setLoadingImages(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !currentEvent) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Event not found'}</Alert>
        <Button onClick={() => navigate('/events')} sx={{ mt: 2 }}>
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/events')}
        >
          Back to Events
        </Button>
        
        <Box display="flex" gap={2}>
          {canEdit && (
            <Button
              variant="outlined"
              onClick={() => navigate(`/events/${id}/edit`)}
            >
              Edit Event
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => navigate(`/events/${id}/upload`)}
          >
            Upload Photos
          </Button>
        </Box>
      </Box>

      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          {currentEvent.name}
        </Typography>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <Chip
            icon={<CalendarToday />}
            label={`${new Date(currentEvent.start_date).toLocaleDateString()} - ${new Date(currentEvent.end_date).toLocaleDateString()}`}
          />
          <Chip
            icon={<CameraAlt />}
            label={`${currentEvent.images?.length || 0} photos`}
          />
        </Box>
        {currentEvent.description && (
          <Typography variant="body1" color="text.secondary">
            {currentEvent.description}
          </Typography>
        )}
      </Box>

      <SearchFilter onSearch={handleSearch} showEventFilter={false} />


      {loadingImages ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : displayedImages && displayedImages.length > 0 ? (
        <Grid container spacing={2}>
          {displayedImages.map((image) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={image.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => navigate(`/images/${image.id}`)}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={image.thumbnail || image.original_image}
                  alt={`Photo ${image.id}`}
                  sx={{ objectFit: 'cover' }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">No photos match your filters.</Alert>
      )}
    </Container>
  );
};

export default EventDetailPage;