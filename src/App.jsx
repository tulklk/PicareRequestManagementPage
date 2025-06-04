import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/700.css';

// Components
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import RequestDetails from './pages/RequestDetails';
import CancelledRequests from './pages/CancelledRequests';
import PendingApprovals from './pages/PendingApprovals';
import RequestHistory from './pages/RequestHistory';
import Profile from './pages/Profile';

const router = {
  future: {
    v7_relativeSplatPath: true
  }
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#2CA068', // Picare green
    },
    secondary: {
      main: '#F47C7C', // Accent pink
    },
    background: {
      default: '#F6FAF8', // Light background
      paper: '#fff',
    },
    text: {
      primary: '#000000', // Changed to black
      secondary: '#333333', // Changed to dark gray
    },
  },
  typography: {
    fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: 1,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router {...router}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/request/:id" element={<RequestDetails />} />
            <Route path="/cancelled-requests" element={<CancelledRequests />} />
            <Route path="/pending-approvals" element={<PendingApprovals />} />
            <Route path="/request-history" element={<RequestHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App; 