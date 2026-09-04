import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Link } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../API/authService'; // Update path as needed

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      // Passes payload directly to match your authService structure
      await changePassword({ currentPassword, newPassword });
      alert('Password updated successfully!');
      navigate('/login');
    } catch (err) {
      setError('Failed to update password. Check your current password.',err);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f4f7f6' }}>
      <Paper sx={{ p: 4, width: 400, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocalHospital sx={{ color: '#00bfa5', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>QuickMart POS</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Change your password</Typography>

        {error && <Typography color="error" variant="body2">{error}</Typography>}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField 
            label="Current Password" 
            type="password" 
            size="small" 
            fullWidth 
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField 
            label="New Password" 
            type="password" 
            size="small" 
            fullWidth 
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" size="large" sx={{ bgcolor: '#00796b', '&:hover': { bgcolor: '#004d40' } }}>
            Update Password
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link href="/login" variant="body2" sx={{ color: '#00796b' }}>Back to Login</Link>
        </Box>
      </Paper>
    </Box>
  );
}