import React from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress, Box, Tooltip, Zoom } from '@mui/material';
import { Error as ErrorIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

function LoadingButton({ 
  loading, 
  children, 
  success, 
  error, 
  errorMessage,
  successMessage,
  loadingMessage = 'Processing...',
  disabled,
  onClick,
  ...props 
}) {
  const getButtonColor = () => {
    if (error) return 'error';
    if (success) return 'success';
    return props.color || 'primary';
  };

  const getIcon = () => {
    if (loading) {
      return <CircularProgress size={24} color="inherit" />;
    }
    if (error) {
      return <ErrorIcon />;
    }
    if (success) {
      return <CheckCircleIcon />;
    }
    return null;
  };

  const getMessage = () => {
    if (loading) return loadingMessage;
    if (error) return errorMessage;
    if (success) return successMessage;
    return children;
  };

  const handleClick = (event) => {
    if (loading || disabled) {
      return;
    }
    if (onClick) {
      onClick(event);
    }
  };

  const buttonContent = (
    <Box sx={{ 
      opacity: loading ? 0 : 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      visibility: loading ? 'hidden' : 'visible'
    }}>
      {getIcon()}
      {getMessage()}
    </Box>
  );

  const loadingSpinner = loading && (
    <CircularProgress
      size={24}
      sx={{
        position: 'absolute',
        left: '50%',
        marginLeft: '-12px'
      }}
    />
  );

  const button = (
    <Button
      disabled={loading || disabled}
      color={getButtonColor()}
      onClick={handleClick}
      {...props}
      sx={{
        position: 'relative',
        minWidth: 120,
        ...props.sx
      }}
    >
      {loadingSpinner}
      {buttonContent}
    </Button>
  );

  if ((error && errorMessage) || (success && successMessage)) {
    return (
      <Tooltip 
        title={error ? errorMessage : successMessage}
        placement="top"
        TransitionComponent={Zoom}
        arrow
        open={error || success}
      >
        {button}
      </Tooltip>
    );
  }

  return button;
}

LoadingButton.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
  success: PropTypes.bool,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'info', 'success', 'warning']),
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  sx: PropTypes.object
};

LoadingButton.defaultProps = {
  loading: false,
  success: false,
  error: false,
  disabled: false,
  loadingMessage: 'Processing...',
  variant: 'contained',
  size: 'medium'
};

export default LoadingButton; 