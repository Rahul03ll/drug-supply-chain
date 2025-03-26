import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { SupplyChainProvider } from './context/SupplyChainContext';

// Lazy load components
const Home = React.lazy(() => import('./components/Home'));
const ManufacturerDashboard = React.lazy(() => import('./components/ManufacturerDashboard'));
const DistributorDashboard = React.lazy(() => import('./components/DistributorDashboard'));
const RetailerDashboard = React.lazy(() => import('./components/RetailerDashboard'));
const ConsumerDashboard = React.lazy(() => import('./components/ConsumerDashboard'));

// Loading component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    }
  }
});

function App() {
  return (
    <ErrorBoundary>
      <SupplyChainProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1, padding: '20px' }}>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={
                      <ErrorBoundary>
                        <Home />
                      </ErrorBoundary>
                    } />
                    <Route path="/manufacturer" element={
                      <ErrorBoundary>
                        <ManufacturerDashboard />
                      </ErrorBoundary>
                    } />
                    <Route path="/distributor" element={
                      <ErrorBoundary>
                        <DistributorDashboard />
                      </ErrorBoundary>
                    } />
                    <Route path="/retailer" element={
                      <ErrorBoundary>
                        <RetailerDashboard />
                      </ErrorBoundary>
                    } />
                    <Route path="/consumer" element={
                      <ErrorBoundary>
                        <ConsumerDashboard />
                      </ErrorBoundary>
                    } />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </Router>
        </ThemeProvider>
      </SupplyChainProvider>
    </ErrorBoundary>
  );
}

export default App; 