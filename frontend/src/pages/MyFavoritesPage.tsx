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
} from '@mui/material';
import { Favorite, CameraAlt } from '@mui/icons-material';
import { imagesService } from '../services/images';
import { Image } from '../types';

const MyFavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await imagesService.getMyFavorites();
      setImages(data);
    } catch (err: any) {
      setError('Failed to load favorites');
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Favorite color="error" sx={{ fontSize: 40 }} />
        <Typography variant="h4" component="h1">
          My Favorites
        </Typography>
      </Box>

      {images.length === 0 ? (
        <Alert severity="info">
          You haven't favorited any photos yet. Start exploring events and favorite photos you love!
        </Alert>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {images.length} {images.length === 1 ? 'photo' : 'photos'}
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
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        By {image.uploaded_by}
                      </Typography>
                      {image.camera_model && (
                        <Chip
                          icon={<CameraAlt />}
                          label={image.camera_model}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Box display="flex" gap={1} mt={1}>
                      <Chip
                        label={`${image.like_count} likes`}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={`${image.view_count} views`}
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

export default MyFavoritesPage;