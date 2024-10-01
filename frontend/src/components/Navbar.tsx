import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Logout, Home, Favorite, CloudUpload, PhotoLibrary, Person } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';

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
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/events')}
        >
          📸 Event Photo Platform
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
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