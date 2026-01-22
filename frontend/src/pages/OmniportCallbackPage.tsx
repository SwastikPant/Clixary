import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography, Alert } from '@mui/material';
import { authService } from '../services/auth';
import { useAppDispatch } from '../store/hooks';
import { loadUser } from '../store/authSlice';

const OmniportCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const errorParam = params.get('error');
  const errorDescription = params.get('error_description');

    const handleOAuth = async () => {
      if (errorParam) {
        setError(errorDescription || `Omniport error: ${errorParam}`);
        return;
      }

      if (!code) {
        setError('Missing authorization code from Omniport.');
        return;
      }

      try {
        // Call backend to exchange code for JWTs and user info
        const response = await authService.loginWithOmniportCode(code);

        // Validate response and store tokens
        if (!response || !response.access || !response.refresh) {
          setError('Invalid response from server during Omniport login.');
          return;
        }

        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);

        // Load full user profile (which will update Redux state)
        await dispatch(loadUser());

        navigate('/events');
      } catch (err: any) {
        console.error(err);
        // Provide a safe fallback for different error shapes
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.non_field_errors?.[0] ||
          err?.message ||
          'Omniport login failed. Please try again.';
        setError(message);
      }
    };

    handleOAuth();
  }, [location.search, navigate, dispatch]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Signing you in via Omniport...
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default OmniportCallbackPage;

