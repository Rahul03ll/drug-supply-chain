import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Card, CardContent, Typography, Box, Tooltip, Zoom } from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

function StatCard({ title, value, icon, color, trend, description }) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null;
    const numericTrend = Number(trend);
    if (isNaN(numericTrend)) return null;
    
    return numericTrend > 0 ? (
      <TrendingUpIcon sx={{ color: 'success.main', ml: 1 }} />
    ) : (
      <TrendingDownIcon sx={{ color: 'error.main', ml: 1 }} />
    );
  };

  return (
    <Tooltip
      title={description || title}
      placement="top"
      TransitionComponent={Zoom}
      arrow
    >
      <Card
        sx={{
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: `${color || 'primary'}.light`,
              borderRadius: '50%',
              p: 1,
              mr: 1
            }}>
              {icon ? React.cloneElement(icon, { sx: { color: `${color || 'primary'}.main` } }) : <InventoryIcon />}
            </Box>
            <Typography color="textSecondary">
              {title || 'Untitled'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" color={`${color || 'primary'}.main`}>
              {value !== undefined && value !== null ? value : 'N/A'}
            </Typography>
            {getTrendIcon()}
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}

StatCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.element,
  color: PropTypes.string,
  trend: PropTypes.number,
  description: PropTypes.string
};

function DashboardStats({ stats, loading }) {
  if (!Array.isArray(stats)) {
    console.error('DashboardStats: stats prop must be an array');
    return null;
  }

  if (stats.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography color="textSecondary">
          No statistics available
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={3} 
          key={stat.id || index}
          sx={{
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.3s'
          }}
        >
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
}

DashboardStats.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      icon: PropTypes.element,
      color: PropTypes.string,
      trend: PropTypes.number,
      description: PropTypes.string
    })
  ).isRequired,
  loading: PropTypes.bool
};

DashboardStats.defaultProps = {
  loading: false
};

export default DashboardStats; 