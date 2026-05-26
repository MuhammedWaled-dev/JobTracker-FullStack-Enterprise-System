import React, { useState,useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, Button, Container, TextField, Typography, 
  Paper, Link, Alert, CircularProgress 
} from '@mui/material';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const from = location.state?.from?.pathname || '/dashboard';
  const { login , isAuthenticated } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setErrorMsg(null);
      try {
        const response = await authService.login(values);
        login(response.token);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Failed to login. Please check your credentials.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
            Job Tracker
          </Typography>
          <Typography component="h2" variant="h6" align="center" gutterBottom color='black' >
            Sign In
          </Typography>

          {successMessage && !errorMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
