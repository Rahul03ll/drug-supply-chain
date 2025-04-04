// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract DrugSupplyAccessControl is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");

 // Remove these lines — already present in OpenZeppelin
// event RoleGranted(...);
// event RoleRevoked(...);

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only admin can perform this action");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addManufacturer(address account) external onlyAdmin {
        require(!hasRole(MANUFACTURER_ROLE, account), "Account already has MANUFACTURER_ROLE");
        _grantRole(MANUFACTURER_ROLE, account);
        emit RoleGranted(MANUFACTURER_ROLE, account, msg.sender);
    }

    function addDistributor(address account) external onlyAdmin {
        require(!hasRole(DISTRIBUTOR_ROLE, account), "Account already has DISTRIBUTOR_ROLE");
        _grantRole(DISTRIBUTOR_ROLE, account);
        emit RoleGranted(DISTRIBUTOR_ROLE, account, msg.sender);
    }

    function addPharmacy(address account) external onlyAdmin {
        require(!hasRole(PHARMACY_ROLE, account), "Account already has PHARMACY_ROLE");
        _grantRole(PHARMACY_ROLE, account);
        emit RoleGranted(PHARMACY_ROLE, account, msg.sender);
    }

    function addRegulator(address account) external onlyAdmin {
        require(!hasRole(REGULATOR_ROLE, account), "Account already has REGULATOR_ROLE");
        _grantRole(REGULATOR_ROLE, account);
        emit RoleGranted(REGULATOR_ROLE, account, msg.sender);
    }

    function removeManufacturer(address account) external onlyAdmin {
        _revokeRole(MANUFACTURER_ROLE, account);
        emit RoleRevoked(MANUFACTURER_ROLE, account, msg.sender);
    }

    function removeDistributor(address account) external onlyAdmin {
        _revokeRole(DISTRIBUTOR_ROLE, account);
        emit RoleRevoked(DISTRIBUTOR_ROLE, account, msg.sender);
    }

    function removePharmacy(address account) external onlyAdmin {
        _revokeRole(PHARMACY_ROLE, account);
        emit RoleRevoked(PHARMACY_ROLE, account, msg.sender);
    }

    function removeRegulator(address account) external onlyAdmin {
        _revokeRole(REGULATOR_ROLE, account);
        emit RoleRevoked(REGULATOR_ROLE, account, msg.sender);
    }

    function transferAdminRole(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "New admin cannot be the zero address");
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
