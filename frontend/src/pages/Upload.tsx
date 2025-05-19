import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface UploadProps {
  onUpload: (file: File) => Promise<void>;
  uploadLoading: boolean;
  uploadError: string | null;
}

const Upload: React.FC<UploadProps> = ({ onUpload, uploadLoading, uploadError }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
      onUpload(file);
    } else {
      alert('Please upload a CSV file');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Employee Data
      </Typography>

      <Paper
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h6">
            Drag and drop your CSV file here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
          <Button
            variant="contained"
            component="label"
            disabled={uploadLoading}
          >
            Choose File
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileInput}
            />
          </Button>
          <Typography variant="body2" color="text.secondary">
            Supported format: CSV
          </Typography>
        </Box>
      </Paper>

      {uploadLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {uploadError}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Instructions
        </Typography>
        <Typography variant="body2" paragraph>
          1. Prepare your employee data in a CSV file with the following columns:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>Name</li>
          <li>Department</li>
          <li>Position</li>
          <li>Email</li>
          <li>Salary</li>
          <li>Performance Score</li>
          <li>Projects (comma-separated)</li>
          <li>Skills (comma-separated)</li>
        </Box>
        <Typography variant="body2" paragraph>
          2. Make sure all required fields are filled and data is properly formatted.
        </Typography>
        <Typography variant="body2">
          3. Upload the file using the drag and drop area or the Choose File button above.
        </Typography>
      </Box>
    </Box>
  );
};

export default Upload; 