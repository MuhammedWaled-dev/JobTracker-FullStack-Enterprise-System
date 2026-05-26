import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent,
  CircularProgress, Alert, FormControl, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Divider, Tooltip
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { OpenInNew as DetailIcon } from '@mui/icons-material';
import { taskService } from '../services/taskService';
import { TaskStatus, type TaskDto } from '../types';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal
  const [detailTask, setDetailTask] = useState<TaskDto | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getAssignedTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateStatus(taskId, { status: newStatus });
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleOpenDetail = (task: TaskDto) => {
    setDetailTask(task);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setDetailTask(null);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Todo:  return 'default';
      case TaskStatus.Doing: return 'primary';
      case TaskStatus.Done:  return 'success';
      default:               return 'default';
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        My Assigned Tasks
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tasks.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Typography color="textSecondary" align="center" sx={{ mt: 5 }}>
                You have no tasks assigned to you right now.
              </Typography>
            </Grid>
          ) : (
            tasks.map((task) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={task.id}>
                <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardContent sx={{ flexGrow: 1 }}>

                    {/* Başlık + Detay İkonu */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          cursor: 'pointer',
                          maxWidth: '85%',
                          '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                        }}
                        onClick={() => handleOpenDetail(task)}
                      >
                        {task.title}
                      </Typography>
                      <Tooltip title="View Details">
                        <DetailIcon
                          fontSize="small"
                          color="action"
                          sx={{ cursor: 'pointer', mt: 0.5, '&:hover': { color: 'info.main' } }}
                          onClick={() => handleOpenDetail(task)}
                        />
                      </Tooltip>
                    </Box>

                    {/* Açıklama (kırpılmış) */}
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        mb: 2,
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

                    {/* Durum Dropdown */}
                    <Box mb={2}>
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block', fontSize: '1.3rem'  }}>
                        Status
                      </Typography>
                      <FormControl size="small" fullWidth>
                        <Select
                          labelId={`status-label-${task.id}`}
                          value={task.status}
                          onChange={(e: SelectChangeEvent) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          sx={{ bgcolor: `${getStatusColor(task.status)}.light`, fontWeight: 'bold' }}
                        >
                          <MenuItem value={TaskStatus.Todo}>To Do</MenuItem>
                          <MenuItem value={TaskStatus.Doing}>Doing</MenuItem>
                          <MenuItem value={TaskStatus.Done}>Done</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Typography variant="caption" color="textSecondary" display="block" sx={{fontSize: '0.7rem'}} >
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* ── Task Detail Modal ── */}
      <Dialog open={openDetail} onClose={handleCloseDetail} fullWidth maxWidth="sm">
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
                color={getStatusColor(detailTask?.status as TaskStatus) as any}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
            {detailTask?.createdAt && (
              <Box textAlign="right">
                <Typography variant="body2" color="textSecondary">Created</Typography>
                <Typography variant="body2">
                  {new Date(detailTask.createdAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDetail} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Tasks;
