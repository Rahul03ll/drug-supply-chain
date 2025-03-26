import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions 
} from '@mui/material';
import { useSupplyChain } from '../context/SupplyChainContext';

function Navbar() {
  const { setDrugs, setShipments, setInventory } = useSupplyChain();
  const [openDialog, setOpenDialog] = useState(false);

  const handleClearData = () => {
    // Clear localStorage
    localStorage.removeItem('drugs');
    localStorage.removeItem('shipments');
    localStorage.removeItem('inventory');
    
    // Reset application state
    setDrugs([]);
    setShipments([]);
    setInventory([]);
    
    setOpenDialog(false);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'white' 
            }}
          >
            Drug Supply Chain
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/manufacturer">
              Manufacturer
            </Button>
            <Button color="inherit" component={Link} to="/distributor">
              Distributor
            </Button>
            <Button color="inherit" component={Link} to="/retailer">
              Retailer
            </Button>
            <Button color="inherit" component={Link} to="/consumer">
              Consumer
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => setOpenDialog(true)}
              sx={{ 
                ml: 2,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Clear Data
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>
          Clear All Data
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all data? This action cannot be undone.
            This will remove all drugs, shipments, and inventory information.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleClearData}
            color="error"
            variant="contained"
            autoFocus
          >
            Clear All Data
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navbar; 