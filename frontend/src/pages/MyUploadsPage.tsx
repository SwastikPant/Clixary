import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import { CloudUpload, CameraAlt, Visibility, ThumbUp } from '@mui/icons-material';
import { imagesService } from '../services/images';
import { Image } from '../types';
import { useAppSelector } from '../store/hooks';

const MyUploadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPhotographer = user?.role === 'PHOTOGRAPHER' || user?.role === 'COORDINATOR' || user?.role === 'ADMIN';

  useEffect(() => {
    if (isPhotographer) {
      loadUploads();
    } else {
      setLoading(false);
    }
  }, [isPhotographer]);

  const loadUploads = async () => {
    try {
      setLoading(true);
      const data = await imagesService.getMyUploads();
      setImages(data);
    } catch (err: any) {
      setError('Failed to load uploads');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isPhotographer) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Only photographers, coordinators, and admins can upload photos.
          <br />
          Your current role: <strong>{user?.role}</strong>
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const totalViews = images.reduce((sum, img) => sum + img.view_count, 0);
  const totalLikes = images.reduce((sum, img) => sum + img.like_count, 0);
  const totalDownloads = images.reduce((sum, img) => sum + img.download_count, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <CloudUpload color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" component="h1">
          My Uploads
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {images.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Photos
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Visibility color="action" sx={{ fontSize: 30, mb: 1 }} />
            <Typography variant="h4">{totalViews}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Views
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <ThumbUp color="action" sx={{ fontSize: 30, mb: 1 }} />
            <Typography variant="h4">{totalLikes}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Likes
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{totalDownloads}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Downloads
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {images.length === 0 ? (
        <Alert severity="info">
          You haven't uploaded any photos yet. Go to an event and start uploading!
          <Box mt={2}>
            <Button variant="contained" onClick={() => navigate('/events')}>
              Browse Events
            </Button>
          </Box>
        </Alert>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {images.length} {images.length === 1 ? 'photo' : 'photos'} uploaded
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {images.map((image) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={image.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 6,
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
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Chip
                        label={image.privacy}
                        size="small"
                        color={image.privacy === 'PUBLIC' ? 'success' : 'default'}
                      />
                      {image.camera_model && (
                        <Chip
                          icon={<CameraAlt />}
                          label={image.camera_model}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Box display="flex" gap={1}>
                      <Chip
                        icon={<ThumbUp />}
                        label={image.like_count}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        icon={<Visibility />}
                        label={image.view_count}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default MyUploadsPage;