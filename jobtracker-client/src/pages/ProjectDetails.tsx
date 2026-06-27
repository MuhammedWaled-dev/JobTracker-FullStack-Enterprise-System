import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Button, Paper, CircularProgress, Alert,
  Grid, Card, CardContent, Divider, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, InputLabel, FormControl, Tooltip
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  OpenInNew as DetailIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { TaskStatus, type ProjectDto, type TaskDto, type User, Role } from '../types';
import { useAuth } from '../context/AuthContext';

const taskValidationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  assignedUserId: Yup.string().nullable(),
});

const editValidationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
});

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [project, setProject] = useState<ProjectDto | null>(null);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Modal
  const [openModal, setOpenModal] = useState(false);

  // Detail Modal
  const [detailTask, setDetailTask] = useState<TaskDto | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  // Edit Modal
  const [editTask, setEditTask] = useState<TaskDto | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [projectData, tasksData, usersData] = await Promise.all([
        projectService.getById(id),
        taskService.getByProjectId(id),
        userService.getAll().catch(() => [])
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Create Task ───────────────────────────────────────────────────────────
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setOpenModal(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: { title: '', description: '', assignedUserId: '' },
    validationSchema: taskValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!id) return;
        await taskService.create({
          title: values.title,
          description: values.description,
          projectId: id,
          assignedUserId: values.assignedUserId || null,
        });
        handleClose();
        fetchData();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to create task');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ── Edit Task ─────────────────────────────────────────────────────────────
  const handleOpenEdit = (task: TaskDto) => {
    setEditTask(task);
    editFormik.setValues({ title: task.title, description: task.description });
    setOpenEditModal(true);
  };

  const handleCloseEdit = () => {
    setOpenEditModal(false);
    setEditTask(null);
    editFormik.resetForm();
  };

  const editFormik = useFormik({
    initialValues: { title: '', description: '' },
    validationSchema: editValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!editTask) return;
      try {
        await taskService.update(editTask.id, {
          title: values.title,
          description: values.description,
        });
        handleCloseEdit();
        fetchData();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to update task');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ── Detail Modal ──────────────────────────────────────────────────────────
  const handleOpenDetail = (task: TaskDto) => {
    setDetailTask(task);
    setOpenDetailModal(true);
  };

  const handleCloseDetail = () => {
    setOpenDetailModal(false);
    setDetailTask(null);
  };

  // ── Status & Delete ───────────────────────────────────────────────────────
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateStatus(taskId, { status: newStatus });
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(taskId);
        fetchData();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleAssignUser = async (taskId: string, userId: string) => {
    try {
      await taskService.assignUser(taskId, userId);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to assign user');
    }
  };

  const getStatusColor = (status: TaskStatus | undefined): 'default' | 'primary' | 'success' => {
    switch (status) {
      case TaskStatus.Todo:  return 'default';
      case TaskStatus.Doing: return 'primary';
      case TaskStatus.Done:  return 'success';
      default:               return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Project not found'}</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/projects')} sx={{ mt: 4 }}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/projects')} sx={{ mb: 2 }}>
        Back to Projects
      </Button>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          {project.name}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {project.description}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Created on: {new Date(project.createdAt).toLocaleDateString()}
        </Typography>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Project Tasks
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ borderRadius: 2 }}>
          Create Task
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {tasks.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography color="textSecondary">No tasks found. Create one to get started!</Typography>
            </Paper>
          </Grid>
        ) : (
          tasks.map((task) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={task.id}>
              <Card elevation={2} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Başlık + Aksiyonlar */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" fontWeight="bold" noWrap sx={{ maxWidth: '70%' }}>
                      {task.title}
                    </Typography>
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="info" onClick={() => handleOpenDetail(task)}>
                          <DetailIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Task">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(task)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Task">
                        <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Açıklama (kırpılmış) */}
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      mb: 2,
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleOpenDetail(task)}
                  >
                    {task.description}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  {/* Durum Seçimi */}
                  <Box mb={2}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id={`status-label-${task.id}`}>Status</InputLabel>
                      <Select
                        labelId={`status-label-${task.id}`}
                        value={task.status}
                        label="Status"
                        onChange={(e: SelectChangeEvent) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        <MenuItem value={TaskStatus.Todo}>To Do</MenuItem>
                        <MenuItem value={TaskStatus.Doing}>Doing</MenuItem>
                        <MenuItem value={TaskStatus.Done}>Done</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Atanan Kişi — Inline Dropdown */}
                  <FormControl size="small" fullWidth>
                    <InputLabel id={`assign-label-${task.id}`}>Assigned to</InputLabel>
                    <Select
                      labelId={`assign-label-${task.id}`}
                      value={task.assignedUserId ?? ''}
                      label="Assigned to"
                      onChange={(e: SelectChangeEvent) =>
                        handleAssignUser(task.id, e.target.value)
                      }
                    >
                      <MenuItem value=""><em>Unassigned</em></MenuItem>
                      {users.map((u) => (
                        <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* ── Create Task Modal ── */}
      <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold" color="primary">Create New Task</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent dividers>
            <TextField
              margin="dense" fullWidth id="title" name="title" label="Task Title"
              value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense" fullWidth id="description" name="description" label="Description"
              multiline rows={3}
              value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              sx={{ mb: 2 }}
            />
            {(currentUser?.role === Role.Admin || users.length > 0) && (
              <FormControl fullWidth margin="dense">
                <InputLabel id="assign-user-label">Assign To (Optional)</InputLabel>
                <Select
                  labelId="assign-user-label" id="assignedUserId" name="assignedUserId"
                  value={formik.values.assignedUserId} label="Assign To (Optional)"
                  onChange={formik.handleChange}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>{user.name} ({user.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleClose} color="inherit" disabled={formik.isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : undefined}>
              Add Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Edit Task Modal ── */}
      <Dialog open={openEditModal} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold" color="primary">Edit Task</DialogTitle>
        <form onSubmit={editFormik.handleSubmit}>
          <DialogContent dividers>
            <TextField
              margin="dense" fullWidth id="edit-title" name="title" label="Task Title"
              value={editFormik.values.title} onChange={editFormik.handleChange} onBlur={editFormik.handleBlur}
              error={editFormik.touched.title && Boolean(editFormik.errors.title)}
              helperText={editFormik.touched.title && editFormik.errors.title}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense" fullWidth id="edit-description" name="description" label="Description"
              multiline rows={4}
              value={editFormik.values.description} onChange={editFormik.handleChange} onBlur={editFormik.handleBlur}
              error={editFormik.touched.description && Boolean(editFormik.errors.description)}
              helperText={editFormik.touched.description && editFormik.errors.description}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseEdit} color="inherit" disabled={editFormik.isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={editFormik.isSubmitting}
              startIcon={editFormik.isSubmitting ? <CircularProgress size={20} /> : undefined}>
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Task Detail Modal ── */}
      <Dialog open={openDetailModal} onClose={handleCloseDetail} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold" color="primary">
          {detailTask?.title}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" gutterBottom>Description</Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
            {detailTask?.description}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="textSecondary">Status</Typography>
              <Chip
                label={detailTask?.status}
                color={getStatusColor(detailTask?.status)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Box textAlign="right">
              <Typography variant="body2" color="textSecondary">Assigned to</Typography>
              <Chip
                size="small"
                label={detailTask?.assignedUserId ? users.find(u => u.id === detailTask.assignedUserId)?.name || 'Unknown' : 'Unassigned'}
                color={detailTask?.assignedUserId ? 'secondary' : 'default'}
                variant={detailTask?.assignedUserId ? 'filled' : 'outlined'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
          {detailTask?.createdAt && (
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 2 }}>
              Created: {new Date(detailTask.createdAt).toLocaleString()}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDetail} variant="outlined">Close</Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => { handleCloseDetail(); handleOpenEdit(detailTask!); }}
          >
            Edit Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetails;
