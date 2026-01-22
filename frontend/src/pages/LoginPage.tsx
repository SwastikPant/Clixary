import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Link,
  Divider,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/authSlice';
import { authService } from '../services/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [omniLoading, setOmniLoading] = useState(false);
  const [omniError, setOmniError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/events');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await dispatch(login({ username, password }));
  };

  const handleOmniportLogin = async () => {
    try {
      setOmniError(null);
      setOmniLoading(true);
      const url = await authService.getOmniportAuthorizationUrl();
      window.location.href = url;
    } catch (err: any) {
      console.error(err);
      setOmniError('Failed to start Omniport login. Please try again.');
    } finally {
      setOmniLoading(false);
    }
  };

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
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 800,
              letterSpacing: '0.6px',
              background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Clixary
          </Typography>
          <Typography component="h2" variant="h6" align="center" color="text.secondary" gutterBottom>
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {omniError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {omniError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Button
              type="button"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={handleOmniportLogin}
              disabled={omniLoading}
            >
              {omniLoading ? 'Redirecting to Omniport...' : 'Login with Omniport'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link href="/register" variant="body2">
                Don't have an account? Register
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;