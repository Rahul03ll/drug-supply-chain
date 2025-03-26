import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Stepper, Step, StepLabel, Tooltip, Fade, Chip } from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  Factory as FactoryIcon,
  Thermostat as ThermostatIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const VALID_STAGES = [
  'manufacturing',
  'distribution',
  'in transit',
  'delivered to retailer',
  'at retailer',
  'sold to customer'
];

const getStepIcon = (stage) => {
  if (!stage) return <ErrorIcon color="error" />;
  
  switch (stage.toLowerCase()) {
    case 'manufacturing':
      return <FactoryIcon />;
    case 'distribution':
    case 'in transit':
      return <LocalShippingIcon />;
    case 'delivered to retailer':
      return <CheckCircleIcon />;
    case 'at retailer':
      return <InventoryIcon />;
    case 'sold to customer':
      return <ShoppingCartIcon />;
    default:
      console.warn(`Unknown stage: ${stage}`);
      return <InventoryIcon />;
  }
};

const getStepColor = (stage, temperature) => {
  // Check temperature first
  if (temperature) {
    const temp = parseFloat(temperature);
    if (!isNaN(temp)) {
      if (temp > 30) return 'error';
      if (temp > 25) return 'warning';
    }
  }

  // Then check stage
  if (!stage) return 'error';
  
  switch (stage.toLowerCase()) {
    case 'manufacturing':
      return 'primary';
    case 'distribution':
    case 'in transit':
      return 'info';
    case 'delivered to retailer':
    case 'at retailer':
      return 'success';
    case 'sold to customer':
      return 'secondary';
    default:
      return 'default';
  }
};

const StepDetails = ({ location, date, temperature }) => {
  const isValidTemp = temperature && !isNaN(parseFloat(temperature));
  const temp = isValidTemp ? parseFloat(temperature) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationIcon fontSize="small" color="action" />
        <Typography variant="caption" color="textSecondary">
          {location || 'Location not available'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EventIcon fontSize="small" color="action" />
        <Typography variant="caption" color="textSecondary">
          {date || 'Date not available'}
        </Typography>
      </Box>
      {isValidTemp ? (
        <Tooltip 
          title={`Temperature: ${temperature}°C`}
          placement="right"
          arrow
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThermostatIcon 
              fontSize="small" 
              color={temp > 25 ? "warning" : "action"} 
            />
            <Chip
              label={`${temperature}°C`}
              size="small"
              color={temp > 30 ? "error" : temp > 25 ? "warning" : "default"}
            />
          </Box>
        </Tooltip>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThermostatIcon fontSize="small" color="action" />
          <Typography variant="caption" color="textSecondary">
            Temperature not available
          </Typography>
        </Box>
      )}
    </Box>
  );
};

StepDetails.propTypes = {
  location: PropTypes.string,
  date: PropTypes.string,
  temperature: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

function ProductPath({ path, loading }) {
  if (!path || !Array.isArray(path) || path.length === 0) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center', p: 3 }}>
        <InventoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography color="text.secondary">
          No path information available
        </Typography>
      </Box>
    );
  }

  const hasInvalidStages = path.some(step => 
    !step.stage || !VALID_STAGES.includes(step.stage.toLowerCase())
  );

  if (hasInvalidStages) {
    console.warn('Some stages in the path are invalid:', 
      path.filter(step => !VALID_STAGES.includes(step.stage?.toLowerCase()))
    );
  }

  return (
    <Fade in={!loading}>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalShippingIcon /> Product Path
        </Typography>
        <Stepper 
          orientation="vertical" 
          sx={{ 
            ml: 2,
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.3s'
          }}
        >
          {path.map((step, index) => (
            <Step key={step.id || index} active={true}>
              <StepLabel
                error={!step.stage || !VALID_STAGES.includes(step.stage.toLowerCase())}
                StepIconComponent={() => React.cloneElement(
                  getStepIcon(step.stage),
                  { color: getStepColor(step.stage, step.temperature) }
                )}
              >
                <Typography 
                  variant="body2" 
                  color={`${getStepColor(step.stage, step.temperature)}.main`}
                  sx={{ fontWeight: 'medium' }}
                >
                  {step.stage || 'Unknown Stage'}
                </Typography>
                <StepDetails {...step} />
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Fade>
  );
}

ProductPath.propTypes = {
  path: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      stage: PropTypes.string.isRequired,
      location: PropTypes.string,
      date: PropTypes.string,
      temperature: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ),
  loading: PropTypes.bool
};

ProductPath.defaultProps = {
  loading: false
};

export default ProductPath; 