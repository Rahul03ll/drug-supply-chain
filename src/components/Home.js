import React from 'react';
import { Container, Typography, Paper, Grid, Box } from '@mui/material';
import { LocalShipping, Factory, Store, Person } from '@mui/icons-material';

function Home() {
  const roles = [
    {
      title: 'Manufacturer',
      icon: <Factory fontSize="large" />,
      description: 'Create and register new drugs in the supply chain'
    },
    {
      title: 'Distributor',
      icon: <LocalShipping fontSize="large" />,
      description: 'Handle drug distribution and transportation'
    },
    {
      title: 'Retailer',
      icon: <Store fontSize="large" />,
      description: 'Manage drug inventory and sales'
    },
    {
      title: 'Consumer',
      icon: <Person fontSize="large" />,
      description: 'Track and verify drug authenticity'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to Drug Supply Chain
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom align="center" color="textSecondary">
        A blockchain-based solution for pharmaceutical supply chain management
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {roles.map((role, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
              elevation={3}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                {role.icon}
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                {role.title}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {role.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home; 