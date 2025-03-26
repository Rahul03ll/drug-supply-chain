// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract DrugSupplyAccessControl is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addManufacturer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MANUFACTURER_ROLE, account);
    }

    function addDistributor(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, account);
    }

    function addPharmacy(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PHARMACY_ROLE, account);
    }

    function addRegulator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(REGULATOR_ROLE, account);
    }

    function removeManufacturer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MANUFACTURER_ROLE, account);
    }

    function removeDistributor(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(DISTRIBUTOR_ROLE, account);
    }

    function removePharmacy(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(PHARMACY_ROLE, account);
    }

    function removeRegulator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(REGULATOR_ROLE, account);
    }
} 