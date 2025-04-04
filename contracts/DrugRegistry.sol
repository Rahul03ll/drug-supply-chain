// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DrugRegistry is AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _drugIds;
    Counters.Counter private _serialNumbers;

    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Manufacturer {
        string name;
        string location;
        string license;
        bool isActive;
    }

    struct Drug {
        uint256 id;
        string name;
        string description;
        address manufacturer;
        uint256 manufacturingDate;
        uint256 expiryDate;
        bool requiresTemperatureControl;
        uint256 minTemperature;
        uint256 maxTemperature;
        bool isActive;
        address registeredBy;
    }

    mapping(uint256 => Drug) public drugs;
    mapping(address => Manufacturer) public manufacturers;
    mapping(uint256 => uint256) public serialToDrugId;

    event DrugRegistered(uint256 indexed drugId, string name, address indexed manufacturer);
    event ManufacturerRegistered(address indexed manufacturer, string name, string license);
    event ManufacturerDeactivated(address indexed manufacturer);
    event SerialNumberGenerated(uint256 indexed drugId, uint256 serialNumber);
    event DrugDeactivated(uint256 indexed drugId, address indexed admin);

    modifier onlyActiveManufacturer() {
        require(hasRole(MANUFACTURER_ROLE, msg.sender), "Not a manufacturer");
        require(manufacturers[msg.sender].isActive, "Manufacturer is inactive");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function registerManufacturer(
        address _manufacturer,
        string memory _name,
        string memory _location,
        string memory _license
    ) external onlyRole(ADMIN_ROLE) {
        require(_manufacturer != address(0), "Invalid manufacturer address");
        require(!hasRole(MANUFACTURER_ROLE, _manufacturer), "Already registered");

        manufacturers[_manufacturer] = Manufacturer({
            name: _name,
            location: _location,
            license: _license,
            isActive: true
        });

        _grantRole(MANUFACTURER_ROLE, _manufacturer);
        emit ManufacturerRegistered(_manufacturer, _name, _license);
    }

    function deactivateManufacturer(address _manufacturer) external onlyRole(ADMIN_ROLE) {
        require(hasRole(MANUFACTURER_ROLE, _manufacturer), "Not a manufacturer");
        require(manufacturers[_manufacturer].isActive, "Already inactive");

        manufacturers[_manufacturer].isActive = false;
        _revokeRole(MANUFACTURER_ROLE, _manufacturer); // Remove role to prevent further actions
        emit ManufacturerDeactivated(_manufacturer);
    }

    function registerDrug(
        string memory _name,
        string memory _description,
        uint256 _manufacturingDate,
        uint256 _expiryDate,
        bool _requiresTemperatureControl,
        uint256 _minTemperature,
        uint256 _maxTemperature
    ) external onlyActiveManufacturer returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_manufacturingDate < _expiryDate, "Invalid dates");
        require(!_requiresTemperatureControl || _minTemperature < _maxTemperature, "Invalid temperature range");

        _drugIds.increment();
        uint256 newDrugId = _drugIds.current();

        drugs[newDrugId] = Drug({
            id: newDrugId,
            name: _name,
            description: _description,
            manufacturer: msg.sender, // Address of manufacturer
            manufacturingDate: _manufacturingDate,
            expiryDate: _expiryDate,
            requiresTemperatureControl: _requiresTemperatureControl,
            minTemperature: _requiresTemperatureControl ? _minTemperature : 0,
            maxTemperature: _requiresTemperatureControl ? _maxTemperature : 0,
            isActive: true,
            registeredBy: msg.sender
        });

        emit DrugRegistered(newDrugId, _name, msg.sender);
        return newDrugId;
    }

    function generateSerialNumber(uint256 _drugId) external onlyActiveManufacturer returns (uint256) {
        require(_drugId > 0 && _drugId <= _drugIds.current(), "Invalid drug ID");
        require(drugs[_drugId].isActive, "Drug is inactive");
        require(drugs[_drugId].registeredBy == msg.sender, "Not the drug manufacturer");

        _serialNumbers.increment();
        uint256 serialNumber = _serialNumbers.current();
        serialToDrugId[serialNumber] = _drugId;

        emit SerialNumberGenerated(_drugId, serialNumber);
        return serialNumber;
    }

    function getDrugBySerial(uint256 _serialNumber) external view returns (Drug memory) {
        uint256 drugId = serialToDrugId[_serialNumber];
        require(drugId > 0, "Serial number not found");
        require(drugs[drugId].isActive, "Drug is inactive");

        return drugs[drugId];
    }

    function setDrugInactive(uint256 _drugId) external onlyRole(ADMIN_ROLE) {
        require(_drugId > 0 && _drugId <= _drugIds.current(), "Invalid drug ID");
        require(drugs[_drugId].isActive, "Drug is already inactive");

        drugs[_drugId].isActive = false;
        emit DrugDeactivated(_drugId, msg.sender);
    }

    function getDrugCount() external view returns (uint256) {
        return _drugIds.current();
    }

    function getSerialCount() external view returns (uint256) {
        return _serialNumbers.current();
    }

    function getTemperatureLimits(uint256 _drugId) external view returns (bool, uint256, uint256, bool) {
        Drug memory drug = drugs[_drugId];
        return (
            drug.id != 0 && drug.isActive, 
            drug.minTemperature, 
            drug.maxTemperature, 
            drug.requiresTemperatureControl
        );
    }
}
