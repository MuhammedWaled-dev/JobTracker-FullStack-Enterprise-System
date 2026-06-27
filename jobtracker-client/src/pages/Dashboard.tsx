import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Container, Grid, Card, 
  CircularProgress, Alert 
} from '@mui/material';
import { Assignment, CheckCircle, Warning } from '@mui/icons-material';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { TaskStatus, type ProjectDto, type TaskDto } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [fetchedProjects, fetchedTasks] = await Promise.all([
          projectService.getAll(),
          taskService.getAll()
        ]);
        setProjects(fetchedProjects);
        setTasks(fetchedTasks);
      } catch (err: unknown) {
        const errorMsg = err as { response?: { data?: { message?: string } } };
        setError(errorMsg.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.Done).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Done).length;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
        Here's what's happening in your workspace today. ({user?.role} Access)
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Total Projects Card */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.light', color: 'white', mr: 2 }}>
                <Assignment fontSize="large" />
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary" fontWeight="bold">
                  Total Projects
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {projects.length}
                </Typography>
              </Box>
            </Card>
          </Grid>
          
          {/* Pending Tasks Card */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.light', color: 'white', mr: 2 }}>
                <Warning fontSize="large" />
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary" fontWeight="bold">
                  Pending Tasks
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {pendingTasks}
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Completed Tasks Card */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.light', color: 'white', mr: 2 }}>
                <CheckCircle fontSize="large" />
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary" fontWeight="bold">
                  Completed Tasks
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {completedTasks}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
