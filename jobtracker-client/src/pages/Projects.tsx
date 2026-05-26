import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Container, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { projectService } from '../services/projectService';
import { useNavigate } from 'react-router-dom';
import type { ProjectDto } from '../types';

const validationSchema = Yup.object({
  name: Yup.string().required('Project name is required'),
  description: Yup.string().required('Description is required'),
});

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [openModal, setOpenModal] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setOpenModal(false);
    formik.resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(id);
        fetchProjects(); // Refresh after delete
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  const formik = useFormik({
    initialValues: { name: '', description: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await projectService.create(values);
        handleClose();
        fetchProjects(); // Automatically refresh table
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to create project');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Projects
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpen}
          sx={{ borderRadius: 2 }}
        >
          Create Project
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'primary.light' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created At</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No projects found. Create one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow 
                    key={project.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <TableCell sx={{ fontWeight: 'medium' }}>{project.name}</TableCell>
                    <TableCell>{project.description}</TableCell>
                    <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="error" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents row click navigation
                          handleDelete(project.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Project Modal */}
      <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold" color="primary">Create New Project</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent dividers>
            <TextField
              margin="dense"
              fullWidth
              id="name"
              name="name"
              label="Project Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleClose} color="inherit" disabled={formik.isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : undefined}
            >
              Save Project
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Projects;
