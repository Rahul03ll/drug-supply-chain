import React, { createContext, useContext, useState, useEffect } from 'react';

const SupplyChainContext = createContext();

export function SupplyChainProvider({ children }) {
  // Load initial state from localStorage or use empty arrays
  const [drugs, setDrugs] = useState(() => {
    const savedDrugs = localStorage.getItem('drugs');
    return savedDrugs ? JSON.parse(savedDrugs) : [];
  });

  const [shipments, setShipments] = useState(() => {
    const savedShipments = localStorage.getItem('shipments');
    return savedShipments ? JSON.parse(savedShipments) : [];
  });

  const [inventory, setInventory] = useState(() => {
    const savedInventory = localStorage.getItem('inventory');
    return savedInventory ? JSON.parse(savedInventory) : [];
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('drugs', JSON.stringify(drugs));
  }, [drugs]);

  useEffect(() => {
    localStorage.setItem('shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Function to add a new drug
  const addDrug = (newDrug) => {
    setDrugs(prevDrugs => [...prevDrugs, newDrug]);
  };

  // Function to add a new shipment and update drug status
  const addShipment = (newShipment) => {
    // Create the distribution path entry
    const distributionEntry = {
      stage: 'Distribution',
      location: `Distribution Center - ${newShipment.destination}`,
      date: newShipment.shipmentDate,
      temperature: newShipment.temperature + '°C'
    };

    // Add distribution entry to the path
    const updatedPath = [
      ...newShipment.path,
      distributionEntry
    ];

    // Update shipment with the new path
    const shipmentWithPath = {
      ...newShipment,
      path: updatedPath
    };

    setShipments(prevShipments => [...prevShipments, shipmentWithPath]);
    
    // Update drug status and path
    setDrugs(prevDrugs =>
      prevDrugs.map(drug =>
        drug.id === newShipment.drugId
          ? { ...drug, status: 'In Transit', path: updatedPath }
          : drug
      )
    );
  };

  // Function to update shipment status and add to inventory if delivered
  const updateShipmentStatus = (shipmentId, status) => {
    const shipment = shipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    // Create the delivery path entry
    const deliveryEntry = {
      stage: 'Delivered to Retailer',
      location: shipment.destination,
      date: new Date().toISOString().split('T')[0],
      temperature: shipment.temperature + '°C'
    };

    // Add delivery entry to the path
    const updatedPath = [
      ...shipment.path,
      deliveryEntry
    ];

    // Update shipment status
    setShipments(prevShipments =>
      prevShipments.map(s =>
        s.id === shipmentId
          ? { ...s, status, path: updatedPath }
          : s
      )
    );

    // Update drug status and path
    setDrugs(prevDrugs =>
      prevDrugs.map(drug =>
        drug.id === shipment.drugId
          ? { ...drug, status: 'At Retailer', path: updatedPath }
          : drug
      )
    );

    // Add to inventory with complete path
    const drug = drugs.find(d => d.id === shipment.drugId);
    if (drug) {
      const existingItem = inventory.find(item => item.id === drug.id);
      if (existingItem) {
        setInventory(prevInventory =>
          prevInventory.map(item =>
            item.id === drug.id
              ? { 
                  ...item, 
                  quantity: item.quantity + parseInt(shipment.quantity),
                  path: updatedPath
                }
              : item
          )
        );
      } else {
        setInventory(prevInventory => [
          ...prevInventory,
          {
            ...drug,
            quantity: parseInt(shipment.quantity),
            path: updatedPath,
            serialNumber: drug.serialNumber,
            batchNumber: drug.batchNumber,
            manufacturingDate: drug.manufacturingDate,
            expiryDate: drug.expiryDate
          }
        ]);
      }
    }
  };

  // Function to record a sale
  const recordSale = (sale) => {
    // Update inventory quantity
    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.id === sale.drugId
          ? {
              ...item,
              quantity: item.quantity - parseInt(sale.quantity),
              path: [
                ...item.path,
                {
                  stage: 'Sold to Customer',
                  location: 'Retail Store',
                  date: sale.date,
                  temperature: item.path[item.path.length - 1].temperature,
                  customer: sale.customerName,
                  customerID: sale.customerID
                }
              ]
            }
          : item
      )
    );

    // Update drug status and path in main drugs array
    setDrugs(prevDrugs =>
      prevDrugs.map(drug =>
        drug.id === sale.drugId
          ? {
              ...drug,
              status: 'Sold',
              path: [
                ...drug.path,
                {
                  stage: 'Sold to Customer',
                  location: 'Retail Store',
                  date: sale.date,
                  temperature: drug.path[drug.path.length - 1].temperature,
                  customer: sale.customerName,
                  customerID: sale.customerID
                }
              ]
            }
          : drug
      )
    );
  };

  // Function to verify a drug
  const verifyDrug = async (serialNumber, batchNumber) => {
    // First check in drugs array
    let drug = drugs.find(
      d => d.serialNumber === serialNumber && d.batchNumber === batchNumber
    );

    // If not found in drugs, check in inventory
    if (!drug) {
      drug = inventory.find(
        d => d.serialNumber === serialNumber && d.batchNumber === batchNumber
      );
    }

    // If not found in either location
    if (!drug) {
      return {
        success: false,
        message: 'Drug not found. Please check the serial number and batch number.'
      };
    }

    // Get the latest shipment for this drug if it exists
    const latestShipment = shipments.find(s => s.drugId === drug.id);
    
    // Combine all information
    const verificationResult = {
      success: true,
      drug: {
        ...drug,
        currentStatus: drug.status,
        lastKnownLocation: drug.path[drug.path.length - 1].location,
        shipmentDetails: latestShipment ? {
          destination: latestShipment.destination,
          status: latestShipment.status,
          expectedDelivery: latestShipment.expectedDelivery
        } : null
      }
    };

    return verificationResult;
  };

  const value = {
    drugs,
    shipments,
    inventory,
    addDrug,
    addShipment,
    updateShipmentStatus,
    recordSale,
    verifyDrug,
    setDrugs,
    setShipments,
    setInventory
  };

  return (
    <SupplyChainContext.Provider value={value}>
      {children}
    </SupplyChainContext.Provider>
  );
}

export function useSupplyChain() {
  const context = useContext(SupplyChainContext);
  if (context === undefined) {
    throw new Error('useSupplyChain must be used within a SupplyChainProvider');
  }
  return context;
} 