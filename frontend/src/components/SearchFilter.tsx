import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  showEventFilter?: boolean;
}

export interface SearchFilters {
  search?: string;
  event?: string;
  privacy?: string;
  ordering?: string;
  uploaded_after?: string;
  uploaded_before?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, showEventFilter = true }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    event: '',
    privacy: '',
    ordering: '-uploaded_at',
    uploaded_after: '',
    uploaded_before: '',
  });

  const handleChange = (field: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    onSearch(cleanedFilters);
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      search: '',
      event: '',
      privacy: '',
      ordering: '-uploaded_at',
      uploaded_after: '',
      uploaded_before: '',
    };
    setFilters(clearedFilters);
    onSearch({ ordering: '-uploaded_at' });
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>

      <Box display="flex" gap={2} alignItems="center">
        <TextField
          fullWidth
          placeholder="Search by photographer or event name..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<Search />}
        >
          Search
        </Button>
        <IconButton
          onClick={() => setShowFilters(!showFilters)}
          color={showFilters ? 'primary' : 'default'}
        >
          <FilterList />
        </IconButton>
      </Box>

      <Collapse in={showFilters}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Event Filter */}
          {showEventFilter && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Event ID"
                type="number"
                value={filters.event}
                onChange={(e) => handleChange('event', e.target.value)}
                size="small"
              />
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Privacy</InputLabel>
              <Select
                value={filters.privacy}
                label="Privacy"
                onChange={(e) => handleChange('privacy', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PUBLIC">Public</MenuItem>
                <MenuItem value="PRIVATE">Private</MenuItem>
              </Select>
            </FormControl>
          </Grid>


          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.ordering}
                label="Sort By"
                onChange={(e) => handleChange('ordering', e.target.value)}
              >
                <MenuItem value="-uploaded_at">Newest First</MenuItem>
                <MenuItem value="uploaded_at">Oldest First</MenuItem>
                <MenuItem value="-like_count">Most Liked</MenuItem>
                <MenuItem value="-view_count">Most Viewed</MenuItem>
                <MenuItem value="-capture_time">Latest Captured</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Uploaded After"
              type="date"
              value={filters.uploaded_after}
              onChange={(e) => handleChange('uploaded_after', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Uploaded Before"
              type="date"
              value={filters.uploaded_before}
              onChange={(e) => handleChange('uploaded_before', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Action Buttons */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClear}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
              >
                Apply Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default SearchFilter;