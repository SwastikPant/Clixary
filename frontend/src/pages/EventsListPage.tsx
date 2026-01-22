import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import { CalendarToday, Visibility } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEvents } from '../store/eventsSlice';



const EventsListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);
  const canCreateEvent = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';

  const eventsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const scrollToEvents = () => {
    if (eventsRef.current) eventsRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <div className="hero">
        <h1 className="hero-title">Clixary</h1>
        <div className="hero-sub">
          <span className="typed">Image management made simple.</span>
        </div>
      </div>

  <Box ref={eventsRef} display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Events
        </Typography>
        {canCreateEvent && (
          <Button
            variant="contained"
            onClick={() => navigate('/events/create')}
          >
            Create Event
          </Button>
        )}
      </Box>

      {events.length === 0 ? (
        <Alert severity="info">No events yet. Create your first event!</Alert>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={event.cover_photo || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={event.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {event.description || 'No description'}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={2} gap={1}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.start_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {event.images && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {event.images.length} photo{event.images.length !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/events/${event.id}`)}
                    fullWidth
                  >
                    View Gallery
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default EventsListPage;