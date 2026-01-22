import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Logout, Home, Favorite, CloudUpload, PhotoLibrary, Person, Label } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import NotificationBell from './NotificationBell';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const canUpload = user?.role === 'PHOTOGRAPHER' || user?.role === 'COORDINATOR' || user?.role === 'ADMIN';

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            fontWeight: 800,
            letterSpacing: '0.6px',
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
          onClick={() => navigate('/events')}
        >
          Clixary
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <NotificationBell />
          <Typography variant="body1" color="inherit">
            {user?.username || 'User'} ({user?.role || 'Guest'})
          </Typography>
          <Button
            color="inherit"
            startIcon={<Home />}
            onClick={() => navigate('/events')}
          >
            Events
          </Button>
          <Button
            color="inherit"
            startIcon={<Favorite />}
            onClick={() => navigate('/favorites')}
          >
            Favorites
          </Button>
          <Button
            color="inherit"
            startIcon={<Label />}
            onClick={() => navigate('/tagged')}
          >
            Tagged
          </Button>
          {canUpload && (
            <Button
              color="inherit"
              startIcon={<CloudUpload />}
              onClick={() => navigate('/my-uploads')}
            >
              My Uploads
            </Button>
          )}
          <Button
            color="inherit"
            startIcon={<PhotoLibrary />}
            onClick={() => navigate('/browse')}
          >
            Browse
          </Button>
          <Button
            color="inherit"
            startIcon={<Person />}
            onClick={() => navigate('/profile')}
          >
            Profile
          </Button>
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;