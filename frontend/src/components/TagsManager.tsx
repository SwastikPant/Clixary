import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { tagsService } from '../services/tags';
import { Tag, User } from '../types';
import Autocomplete from '@mui/material/Autocomplete';
import { usersService } from '../services/users';

interface TagsManagerProps {
  imageId: number;
  tags: Tag[];
  canEdit: boolean;
  onTagsChange: () => void;
  userTags?: User[];
  onUserTagsChange?: () => void;
}

const TagsManager: React.FC<TagsManagerProps> = ({ imageId, tags, canEdit, onTagsChange, userTags = [], onUserTagsChange }) => {
  const [newTag, setNewTag] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [addingUser, setAddingUser] = useState(false);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    setAdding(true);
    setError(null);

    try {
      await tagsService.addToImage(imageId, newTag.trim());
      setNewTag('');
      onTagsChange();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add tag');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      await tagsService.removeFromImage(imageId, tagId);
      onTagsChange();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove tag');
    }
  };

  const handleAddUserTag = async (user: User | null) => {
    if (!user) return;
    setAddingUser(true);
    setError(null);
    try {
      await tagsService.addUserToImage(imageId, user.id);
      setUserQuery('');
      onUserTagsChange && onUserTagsChange();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to tag user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUserTag = async (userId: number) => {
    try {
      await tagsService.removeUserFromImage(imageId, userId);
      onUserTagsChange && onUserTagsChange();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove user tag');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {tags.length === 0 && userTags.length === 0 ? (
          <Chip label="No tags yet" variant="outlined" size="small" />
        ) : (
          <>
            {tags.map((tag) => (
              <Chip
                key={`t-${tag.id}`}
                label={tag.name}
                color="primary"
                size="small"
                onDelete={canEdit ? () => handleRemoveTag(tag.id) : undefined}
                deleteIcon={<Close />}
              />
            ))}

            {userTags.map((u) => (
              <Chip
                key={`u-${u.id}`}
                label={`@${u.username}`}
                color="secondary"
                size="small"
                onDelete={canEdit ? () => handleRemoveUserTag(u.id) : undefined}
                deleteIcon={<Close />}
              />
            ))}
          </>
        )}
      </Box>

      {canEdit && (
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            placeholder="Add a tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={adding}
            fullWidth
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleAddTag}
            disabled={adding || !newTag.trim()}
          >
            Add
          </Button>
        </Box>
      )}

      {/* User tagging UI */}
      {canEdit && (
        <Box mt={2} display="flex" gap={1} alignItems="center">
          <Autocomplete
            freeSolo={false}
            options={userOptions}
            getOptionLabel={(option) => option.username}
            inputValue={userQuery}
            onInputChange={async (_, value) => {
              setUserQuery(value);
              if (value.trim().length >= 1) {
                try {
                  const users = await usersService.search(value.trim());
                  setUserOptions(users);
                } catch (e) {
                  // ignore
                }
              } else {
                setUserOptions([]);
              }
            }}
            onChange={(_, value) => handleAddUserTag(value)}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField {...params} size="small" placeholder="Tag a user..." />
            )}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => setUserQuery('')}
            disabled={addingUser}
          >
            Clear
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TagsManager;