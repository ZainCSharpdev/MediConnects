import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  MenuItem,
} from "@mui/material";
import { LocalHospital } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { signinUser } from "../API/authService"; // Update path as needed

export default function Signin() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(" ");
  const [error, setError] = useState("");

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      await signinUser({ name, email, password });
      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please check details.", err);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f4f7f6",
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: 400,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <LocalHospital sx={{ color: "#00bfa5", fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            QuickMart POS
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Create a new account
        </Typography>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        <form
          onSubmit={handleSignin}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <TextField
            label="Full Name"
            size="small"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <TextField
            label="Role"
            select
            size="small"
            fullWidth
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="pharmacist">Pharmacist</MenuItem>
          </TextField>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ bgcolor: "#00796b", "&:hover": { bgcolor: "#004d40" } }}
          >
            Sign Up
          </Button>
        </form>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2">
            Already have an account?{" "}
            <Link href="/login" sx={{ color: "#00796b" }}>
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
