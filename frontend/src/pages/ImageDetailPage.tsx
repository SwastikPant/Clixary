import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  ThumbUp,
  ThumbUpOutlined,
  Download,
  Visibility,
  CameraAlt,
  Delete,
} from '@mui/icons-material';
import { imagesService } from '../services/images';
import { Image } from '../types';
import CommentsSection from '../components/CommentsSection'
import { useAppSelector } from '../store/hooks';

const ImageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [image, setImage] = useState<Image | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppSelector((state) => state.auth);
  const [deleting, setDeleting] = useState(false);

  const isOwner = image && (
    image.uploaded_by === user?.username || 
    user?.role === 'ADMIN'
  );

  const handleDelete = async () => {
    if (!image) return;
    
    if (!window.confirm('Are you sure you want to delete this photo? This cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    try {
      await imagesService.delete(image.id);
      alert('Photo deleted successfully');
      navigate(-1);
    } catch (err: any) {
      alert('Failed to delete photo');
      setDeleting(false);
    }
  };


  useEffect(() => {
    if (id) {
      loadImage(parseInt(id));
    }
  }, [id]);

  const loadImage = async (imageId: number) => {
    try {
      setLoading(true);
      const data = await imagesService.getById(imageId);
      setImage(data);
    } catch (err: any) {
      setError('Failed to load image');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!image) return;
    try {
      const response = await imagesService.like(image.id);
      setImage({
        ...image,
        user_liked: response.liked,
        like_count: response.like_count,
      });
    } catch (err) {
      console.error('Failed to like image:', err);
    }
  };

  const handleFavorite = async () => {
    if (!image) return;
    try {
      const response = await imagesService.favorite(image.id);
      setImage({
        ...image,
        user_favorited: response.favorited,
      });
    } catch (err) {
      console.error('Failed to favorite image:', err);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8000/api/images/${image.id}/download/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          redirect: 'follow'
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `photo-${image.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Download failed:', err);
      window.open(image.original_image, '_blank');
    }
  };

  if (error || !image) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Image not found'}</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Grid container spacing={4}>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={3}
            sx={{
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <img
              src={image.watermarked_image || image.original_image}
              alt={`Image ${image.id}`}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Paper>

          <Box display="flex" gap={2} mt={2} justifyContent="center">
            <Button
              variant={image.user_liked ? 'contained' : 'outlined'}
              startIcon={image.user_liked ? <ThumbUp /> : <ThumbUpOutlined />}
              onClick={handleLike}
            >
              {image.like_count} {image.like_count === 1 ? 'Like' : 'Likes'}
            </Button>
            
            <Button
              variant={image.user_favorited ? 'contained' : 'outlined'}
              color="secondary"
              startIcon={image.user_favorited ? <Favorite /> : <FavoriteBorder />}
              onClick={handleFavorite}
            >
              {image.user_favorited ? 'Favorited' : 'Favorite'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownload}
            >
              Download
            </Button>

            {isOwner && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Photo'}
              </Button>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Photo Details
            </Typography>
            <Divider sx={{ mb: 2 }} />


            <Box mb={2}>
              <Typography variant="caption" color="text.secondary">
                Uploaded by
              </Typography>
              <Typography variant="body1">
                {image.uploaded_by}
              </Typography>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <Chip
                icon={<Visibility />}
                label={`${image.view_count} views`}
                size="small"
              />
              <Chip
                icon={<Download />}
                label={`${image.download_count} downloads`}
                size="small"
              />
            </Box>

            <Box mb={2}>
              <Typography variant="caption" color="text.secondary">
                Uploaded
              </Typography>
              <Typography variant="body2">
                {new Date(image.uploaded_at).toLocaleDateString()}
              </Typography>
            </Box>

            {(image.camera_model || image.capture_time) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  <CameraAlt fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Camera Info
                </Typography>

                {image.camera_model && (
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Camera
                    </Typography>
                    <Typography variant="body2">
                      {image.camera_model}
                    </Typography>
                  </Box>
                )}

                {image.capture_time && (
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Taken on
                    </Typography>
                    <Typography variant="body2">
                      {new Date(image.capture_time).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {image.aperture && (
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Aperture
                    </Typography>
                    <Typography variant="body2">
                      f/{image.aperture}
                    </Typography>
                  </Box>
                )}

                {image.shutter_speed && (
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Shutter Speed
                    </Typography>
                    <Typography variant="body2">
                      {image.shutter_speed}
                    </Typography>
                  </Box>
                )}

                {image.iso && (
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      ISO
                    </Typography>
                    <Typography variant="body2">
                      {image.iso}
                    </Typography>
                  </Box>
                )}
              </>
            )}


            <Divider sx={{ my: 2 }} />
            <Chip
              label={image.privacy}
              color={image.privacy === 'PUBLIC' ? 'success' : 'default'}
              size="small"
            />
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
            <CommentsSection imageId={image.id} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ImageDetailPage;