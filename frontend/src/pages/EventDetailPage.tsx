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
  ButtonGroup,
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
  
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>(() => {
    try {
      if (id) {
        const raw = sessionStorage.getItem(`event_view_${id}`);
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && (obj.viewMode === 'grid' || obj.viewMode === 'cards')) return obj.viewMode;
        }
      }
    } catch (e) {}
    return 'grid';
  });

  const [cardIndex, setCardIndex] = useState<number>(() => {
    try {
      if (id) {
        const raw = sessionStorage.getItem(`event_view_${id}`);
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && typeof obj.cardIndex === 'number') return obj.cardIndex;
        }
      }
    } catch (e) {}
    return 0;
  });

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


  useEffect(() => {
    if (!currentEvent || !id) return;
    const key = `event_view_${id}`;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj.viewMode) setViewMode(obj.viewMode);
        if (typeof obj.cardIndex === 'number') setCardIndex(obj.cardIndex);
      }
    } catch (e) {}
  }, [currentEvent, id]);


  useEffect(() => {
    if (!id) return;
    const key = `event_view_${id}`;
    try {
      sessionStorage.setItem(key, JSON.stringify({ viewMode, cardIndex }));
    } catch (e) {}
  }, [viewMode, cardIndex, id]);

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

  const prevCard = () => {
    if (!displayedImages || displayedImages.length === 0) return;
    setCardIndex((i) => (i - 1 + displayedImages.length) % displayedImages.length);
  };

  const nextCard = () => {
    if (!displayedImages || displayedImages.length === 0) return;
    setCardIndex((i) => (i + 1) % displayedImages.length);
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
        <>
          <Box display="flex" justifyContent="flex-end" mb={2} gap={1}>
            <ButtonGroup variant="outlined" aria-label="view mode">
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
            </ButtonGroup>
          </Box>

          {viewMode === 'grid' ? (
            <Grid container spacing={2}>
                {displayedImages.map((image) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={image.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                    onClick={() => {
                      // persist view state immediately before navigation so unmount doesn't lose it
                      if (id) {
                        try {
                          sessionStorage.setItem(`event_view_${id}`, JSON.stringify({ viewMode, cardIndex }));
                        } catch (e) {}
                      }
                      navigate(`/images/${image.id}`);
                    }}
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
            <Box className="gallery" sx={{ position: 'relative', height: { xs: 340, md: 480 } }}>
              <ul className="cards">
                {displayedImages.map((image, idx) => {
                  const len = displayedImages.length;
                  const raw = (idx - cardIndex + len) % len;
                  const half = Math.floor(len / 2);
                  const signed = raw > half ? raw - len : raw;
                      const spacingPx = 380; // horizontal spacing between card centers (larger so neighbors are more off-screen)
                  const absSigned = Math.abs(signed);
                      const scale = signed === 0 ? 1 : Math.max(0.5, 1 - absSigned * 0.18);
                      const opacity = signed === 0 ? 1 : Math.max(0.08, 1 - absSigned * 0.35);
                  const zIndex = 1000 - absSigned;
                      const rotateY = signed === 0 ? 0 : (signed > 0 ? -12 : 12);
                      const blurPx = absSigned === 0 ? 0 : Math.min(6, absSigned * 2);
                      const translateZ = signed === 0 ? 0 : -absSigned * 30;
                      const transform = `translate(calc(-50% + ${signed * spacingPx}px), -50%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
                  return (
                    <li
                      key={image.id}
                      onClick={() => {
                        // persist view state immediately before navigation so the focused card is restored on return
                        if (id) {
                          try {
                            sessionStorage.setItem(`event_view_${id}`, JSON.stringify({ viewMode, cardIndex }));
                          } catch (e) {}
                        }
                        navigate(`/images/${image.id}`);
                      }}
                      style={{
                        backgroundImage: `url(${image.watermarked_image || image.thumbnail || image.original_image})`,
                        transform,
                        zIndex,
                        opacity,
                        cursor: 'pointer',
                            filter: `blur(${blurPx}px)`,
                            boxShadow: signed === 0 ? '0 24px 64px rgba(0,0,0,0.6)' : '0 8px 20px rgba(0,0,0,0.5)',
                      }}
                    />
                  );
                })}
              </ul>
              <div className="actions" style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}>
                <Button variant="outlined" onClick={prevCard}>Prev</Button>
                <Button variant="outlined" onClick={nextCard}>Next</Button>
              </div>
            </Box>
          )}
        </>
      ) : (
        <Alert severity="info">No photos match your filters.</Alert>
      )}
    </Container>
  );
};

export default EventDetailPage;