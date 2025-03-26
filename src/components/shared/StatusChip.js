import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Tooltip, Zoom } from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LocalShipping as ShippingIcon,
  Pending as PendingIcon,
  Block as BlockedIcon,
  Update as UpdateIcon,
  Inventory as InventoryIcon,
  Timer as TimerIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const STATUS_CONFIG = {
  warning: {
    icon: <WarningIcon />,
    color: 'warning',
    tooltip: 'Warning status'
  },
  success: {
    icon: <CheckCircleIcon />,
    color: 'success',
    tooltip: 'Success status'
  },
  error: {
    icon: <ErrorIcon />,
    color: 'error',
    tooltip: 'Error status'
  },
  shipping: {
    icon: <ShippingIcon />,
    color: 'info',
    tooltip: 'In transit'
  },
  pending: {
    icon: <PendingIcon />,
    color: 'default',
    tooltip: 'Pending action'
  },
  blocked: {
    icon: <BlockedIcon />,
    color: 'error',
    tooltip: 'Blocked'
  },
  processing: {
    icon: <UpdateIcon className="rotating-icon" />,
    color: 'info',
    tooltip: 'Processing'
  },
  inventory: {
    icon: <InventoryIcon />,
    color: 'primary',
    tooltip: 'In inventory'
  },
  expired: {
    icon: <TimerIcon />,
    color: 'error',
    tooltip: 'Expired'
  }
};

const VALID_STATUSES = Object.keys(STATUS_CONFIG);

function StatusChip({ 
  status, 
  label, 
  value, 
  tooltip, 
  onClick,
  variant = 'filled',
  size = 'small',
  disabled = false
}) {
  // Validate status
  const isValidStatus = status && VALID_STATUSES.includes(status.toLowerCase());
  if (!isValidStatus && status) {
    console.warn(`Invalid status: ${status}. Valid statuses are: ${VALID_STATUSES.join(', ')}`);
  }

  const config = isValidStatus ? STATUS_CONFIG[status.toLowerCase()] : {
    icon: <HelpIcon />,
    color: 'default',
    tooltip: 'Unknown status'
  };

  const chipLabel = value || label || status || 'Unknown';
  const tooltipText = tooltip || config.tooltip;

  const handleClick = (event) => {
    if (disabled || !onClick) return;
    onClick(event);
  };

  const chip = (
    <Chip
      icon={config.icon}
      label={chipLabel}
      color={config.color}
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={disabled}
      sx={{
        '& .rotating-icon': {
          animation: onClick && !disabled ? 'spin 2s linear infinite' : 'none',
        },
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
        '&:hover': (!disabled && onClick) ? {
          transform: 'scale(1.05)',
          transition: 'transform 0.2s'
        } : {},
        cursor: (!disabled && onClick) ? 'pointer' : 'default',
        opacity: disabled ? 0.6 : 1
      }}
    />
  );

  return tooltip ? (
    <Tooltip 
      title={tooltipText}
      placement="top"
      TransitionComponent={Zoom}
      arrow
      disabled={disabled}
    >
      {chip}
    </Tooltip>
  ) : chip;
}

StatusChip.propTypes = {
  status: PropTypes.oneOf(VALID_STATUSES),
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tooltip: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['filled', 'outlined']),
  size: PropTypes.oneOf(['small', 'medium']),
  disabled: PropTypes.bool
};

StatusChip.defaultProps = {
  variant: 'filled',
  size: 'small',
  disabled: false
};

export default StatusChip; 