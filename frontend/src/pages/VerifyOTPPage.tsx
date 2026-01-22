import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { authService } from '../services/auth';

const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.verifyOTP(email, otp);
      alert('Email verified! You can now login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Verify Email
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
            We sent a 6-digit code to <strong>{email}</strong>
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
            (Check your email for the OTP)
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter 6-digit OTP"
              name="otp"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputProps={{ maxLength: 6 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyOTPPage;