// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DrugRegistry is AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _drugIds;

    struct Drug {
        uint256 id;
        string name;
        string description;
        string manufacturer;
        uint256 manufacturingDate;
        uint256 expiryDate;
        bool requiresTemperatureControl;
        uint256 minTemperature;
        uint256 maxTemperature;
        bool isActive;
        address registeredBy;
    }

    mapping(uint256 => Drug) public drugs;
    mapping(string => uint256) public drugByName;

    event DrugRegistered(
        uint256 indexed drugId,
        string name,
        string manufacturer,
        address indexed registeredBy
    );

    event DrugUpdated(
        uint256 indexed drugId,
        string name,
        bool isActive
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function registerDrug(
        string memory _name,
        string memory _description,
        string memory _manufacturer,
        uint256 _manufacturingDate,
        uint256 _expiryDate,
        bool _requiresTemperatureControl,
        uint256 _minTemperature,
        uint256 _maxTemperature
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(bytes(_name).length > 0, "Drug name cannot be empty");
        require(drugByName[_name] == 0, "Drug with this name already exists");
        require(_manufacturingDate < _expiryDate, "Invalid dates");

        _drugIds.increment();
        uint256 newDrugId = _drugIds.current();

        drugs[newDrugId] = Drug({
            id: newDrugId,
            name: _name,
            description: _description,
            manufacturer: _manufacturer,
            manufacturingDate: _manufacturingDate,
            expiryDate: _expiryDate,
            requiresTemperatureControl: _requiresTemperatureControl,
            minTemperature: _minTemperature,
            maxTemperature: _maxTemperature,
            isActive: true,
            registeredBy: msg.sender
        });

        drugByName[_name] = newDrugId;

        emit DrugRegistered(newDrugId, _name, _manufacturer, msg.sender);
        return newDrugId;
    }

    function updateDrugStatus(uint256 _drugId, bool _isActive) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_drugId > 0 && _drugId <= _drugIds.current(), "Invalid drug ID");
        
        Drug storage drug = drugs[_drugId];
        drug.isActive = _isActive;

        emit DrugUpdated(_drugId, drug.name, _isActive);
    }

    function getDrug(uint256 _drugId) external view returns (Drug memory) {
        require(_drugId > 0 && _drugId <= _drugIds.current(), "Invalid drug ID");
        return drugs[_drugId];
    }

    function getDrugByName(string memory _name) external view returns (Drug memory) {
        uint256 drugId = drugByName[_name];
        require(drugId > 0, "Drug not found");
        return drugs[drugId];
    }

    function getTotalDrugs() external view returns (uint256) {
        return _drugIds.current();
    }
} 