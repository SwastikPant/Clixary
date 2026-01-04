import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadUser } from './store/authSlice';

// Components
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import EventsListPage from './pages/EventsListPage';
import EventDetailPage from './pages/EventDetailPage';
import ImageUploadPage from './pages/ImageUploadPage';
import ImageDetailPage from './pages/ImageDetailPage';
import MyFavoritesPage from './pages/MyFavoritesPage';
import MyUploadsPage from './pages/MyUploadsPage';
import BrowseImagesPage from './pages/BrowseImagesPage';
import CreateEventPage from './pages/CreateEventPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Routes WITHOUT navbar (login, register, etc.) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />

          {/* Routes WITH navbar (protected pages) */}
          <Route element={<Layout />}>
            <Route
              path="/events"
              element={isAuthenticated ? <EventsListPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/events/:id"
              element={isAuthenticated ? <EventDetailPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/events/:id/upload"
              element={isAuthenticated ? <ImageUploadPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/images/:id"
              element={isAuthenticated ? <ImageDetailPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/favorites"
              element={isAuthenticated ? <MyFavoritesPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/my-uploads"
              element={isAuthenticated ? <MyUploadsPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/browse"
              element={isAuthenticated ? <BrowseImagesPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/events/create"
              element={isAuthenticated ? <CreateEventPage /> : <Navigate to="/login" />}
            />
          </Route>

          {/* Root redirect */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/events" /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;