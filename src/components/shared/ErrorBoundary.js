import React from 'react';
import { Box, Typography, Button, Paper, Collapse, IconButton } from '@mui/material';
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      dismissed: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Report to error tracking service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null, 
      showDetails: false,
      dismissed: false 
    });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleDismiss = () => {
    this.setState({ dismissed: true });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError && !this.state.dismissed) {
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      
      return (
        <Paper 
          sx={{ 
            p: 3, 
            m: 2, 
            position: 'relative',
            border: '1px solid',
            borderColor: 'error.light',
            backgroundColor: 'error.lighter'
          }}
        >
          <IconButton
            size="small"
            onClick={this.handleDismiss}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <WarningIcon color="error" sx={{ fontSize: 60 }} />
            
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong
            </Typography>

            <Typography color="text.secondary" align="center" paragraph>
              {errorMessage}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleRetry}
                startIcon={<RefreshIcon />}
              >
                Try Again
              </Button>

              {this.state.errorInfo && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={this.toggleDetails}
                  startIcon={this.state.showDetails ? <ExpandMoreIcon /> : <BugReportIcon />}
                >
                  {this.state.showDetails ? 'Hide' : 'Show'} Details
                </Button>
              )}
            </Box>

            <Collapse in={this.state.showDetails}>
              <Paper 
                sx={{ 
                  p: 2, 
                  mt: 2, 
                  maxHeight: 200, 
                  overflow: 'auto',
                  backgroundColor: 'grey.100'
                }}
              >
                <Typography component="pre" sx={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Paper>
            </Collapse>
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 