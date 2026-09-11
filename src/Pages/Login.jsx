import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Link } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../API/authService'; // Update path as needed

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ email, password });
      alert('Login successful!');
      navigate('/Dashboard');
    } catch (err) {
      setError('Invalid email or password.',err);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f4f7f6' }}>
      <Paper sx={{ p: 4, width: 400, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocalHospital sx={{ color: '#00bfa5', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>QuickMart POS</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Sign in to your account</Typography>

        {error && <Typography color="error" variant="body2">{error}</Typography>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField 
            label="Email" 
            type="email" 
            size="small" 
            fullWidth 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField 
            label="Password" 
            type="password" 
            size="small" 
            fullWidth 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" size="large" sx={{ bgcolor: '#00796b', '&:hover': { bgcolor: '#004d40' } }}>
            Login
          </Button>
        </form>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Link href="/signin" variant="body2" sx={{ color: '#00796b' }}>Create account</Link>
          <Link href="/change-password" variant="body2" sx={{ color: '#00796b' }}>Change password?</Link>
        </Box>
      </Paper>
    </Box>
  );
}