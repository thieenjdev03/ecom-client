"use client";

import { useState, useRef } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";

import Iconify from "src/components/iconify";
import { paypalApiService } from "src/services/paypal-api";

// ----------------------------------------------------------------------

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  orderId?: string;
  title?: string;
  description?: string;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  onUploadSuccess?: (fileUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url?: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export default function FileUploadModal({
  open,
  onClose,
  orderId,
  title = "Upload File",
  description = "Upload a file for your order",
  acceptedFileTypes = ['image/*', '.pdf', '.doc', '.docx'],
  maxFileSize = 10, // 10MB
  onUploadSuccess,
  onUploadError,
}: FileUploadModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);
    uploadFiles(fileList, newFiles);
  };

  const uploadFiles = async (fileList: File[], fileObjects: UploadedFile[]) => {
    setIsUploading(true);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileObj = fileObjects[i];

      try {
        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          throw new Error(`File size exceeds ${maxFileSize}MB limit`);
        }

        // Validate file type
        const isValidType = acceptedFileTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type.replace('*', '.*'));
        });

        if (!isValidType) {
          throw new Error('Invalid file type');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'orders');
        formData.append('publicId', `order_${orderId || 'unknown'}_${fileObj.id}`);

        // Upload file using API service
        const result = await paypalApiService.uploadFile(file, orderId || 'unknown');

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // Update file status
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, status: 'success', url: result.data!.url, progress: 100 }
            : f
        ));

        onUploadSuccess?.(result.data!.url, file.name);

      } catch (error) {
        console.error('Upload error:', error);
        
        // Update file status with error
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ));

        onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
      }
    }

    setIsUploading(false);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={handleClose} disabled={isUploading}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>

          {/* File Upload Area */}
          <Card
            sx={{
              p: 3,
              border: dragActive ? '2px dashed' : '1px dashed',
              borderColor: dragActive ? 'primary.main' : 'grey.300',
              bgcolor: dragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Stack spacing={2} alignItems="center">
              <Iconify 
                icon="eva:cloud-upload-fill" 
                sx={{ fontSize: 48, color: 'text.secondary' }} 
              />
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Drop files here or click to browse
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Accepted formats: {acceptedFileTypes.join(', ')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Maximum file size: {maxFileSize}MB
              </Typography>
            </Stack>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          {/* File List */}
          {files.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Uploaded Files ({files.length})
              </Typography>
              
              <List dense>
                {files.map((file) => (
                  <ListItem key={file.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={file.name}
                      secondary={
                        <Stack spacing={1}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {formatFileSize(file.size)}
                          </Typography>
                          
                          {file.status === 'uploading' && (
                            <LinearProgress 
                              variant="determinate" 
                              value={file.progress || 0}
                            />
                          )}
                          
                          {file.status === 'error' && (
                            <Alert severity="error">
                              {file.error}
                            </Alert>
                          )}
                          
                          {file.status === 'success' && (
                            <Alert severity="success">
                              Upload successful
                            </Alert>
                          )}
                        </Stack>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'uploading'}
                        size="small"
                      >
                        <Iconify icon="eva:close-fill" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
