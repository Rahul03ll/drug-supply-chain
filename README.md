# Drug Supply Chain Tracking System

A blockchain-based solution for tracking and verifying pharmaceutical products throughout their supply chain lifecycle.

## Features

- Drug registration and tracking
- Supply chain management
- Temperature monitoring
- Location tracking
- Drug verification
- Inventory management
- Sales recording
- Real-time status updates

## Tech Stack

- Solidity (Smart Contracts)
- React.js (Frontend)
- Material-UI (UI Components)
- Web3.js (Blockchain Integration)
- Truffle Framework (Development)

## Project Structure

```
drug-supply-chain/
├── contracts/
│   ├── DrugRegistry.sol
│   └── SupplyChain.sol
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConsumerDashboard.js
│   │   │   ├── RetailerDashboard.js
│   │   │   └── shared/
│   │   ├── context/
│   │   │   └── SupplyChainContext.js
│   │   └── App.js
│   └── package.json
├── migrations/
├── test/
└── truffle-config.js
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Truffle
- Ganache (for local blockchain)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/drug-supply-chain.git
cd drug-supply-chain
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Compile and deploy smart contracts:
```bash
truffle compile
truffle migrate
```

4. Start the frontend application:
```bash
cd frontend
npm start
```

## Smart Contracts

### DrugRegistry.sol
- Manages drug registration and tracking
- Stores drug information
- Handles drug verification
- Maintains supply chain history

### SupplyChain.sol
- Manages supply chain operations
- Handles shipment creation and tracking
- Updates drug status
- Records temperature and location data

## Frontend Components

### RetailerDashboard
- Inventory management
- Stock level monitoring
- Sales recording
- Statistics and analytics

### ConsumerDashboard
- Drug verification
- Supply chain history
- Status checking
- Temperature monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the component library
- Truffle Framework for the development environment
- Web3.js for blockchain integration 