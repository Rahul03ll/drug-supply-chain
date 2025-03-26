// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DrugRegistry.sol";
import "./SupplyChain.sol";

contract TemperatureMonitor is AccessControl {
    DrugRegistry public drugRegistry;
    SupplyChain public supplyChain;

    struct TemperatureAlert {
        uint256 batchId;
        uint256 drugId;
        uint256 temperature;
        uint256 timestamp;
        string location;
        bool isResolved;
        string resolution;
    }

    mapping(uint256 => TemperatureAlert[]) public temperatureAlerts;
    mapping(uint256 => uint256) public alertCount;

    event TemperatureAlertCreated(
        uint256 indexed batchId,
        uint256 indexed drugId,
        uint256 temperature,
        string location
    );

    event TemperatureAlertResolved(
        uint256 indexed batchId,
        uint256 indexed drugId,
        string resolution
    );

    constructor(address _drugRegistry, address _supplyChain) {
        drugRegistry = DrugRegistry(_drugRegistry);
        supplyChain = SupplyChain(_supplyChain);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function checkTemperature(
        uint256 _batchId,
        uint256 _temperature,
        string memory _location
    ) external {
        require(_batchId > 0, "Invalid batch ID");
        
        SupplyChain.Batch memory batch = supplyChain.getBatch(_batchId);
        DrugRegistry.Drug memory drug = drugRegistry.getDrug(batch.drugId);

        if (drug.requiresTemperatureControl) {
            if (_temperature < drug.minTemperature || _temperature > drug.maxTemperature) {
                TemperatureAlert memory alert = TemperatureAlert({
                    batchId: _batchId,
                    drugId: batch.drugId,
                    temperature: _temperature,
                    timestamp: block.timestamp,
                    location: _location,
                    isResolved: false,
                    resolution: ""
                });

                temperatureAlerts[_batchId].push(alert);
                alertCount[_batchId]++;

                emit TemperatureAlertCreated(_batchId, batch.drugId, _temperature, _location);
            }
        }
    }

    function resolveTemperatureAlert(
        uint256 _batchId,
        uint256 _alertIndex,
        string memory _resolution
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_batchId > 0, "Invalid batch ID");
        require(_alertIndex < temperatureAlerts[_batchId].length, "Invalid alert index");
        
        TemperatureAlert storage alert = temperatureAlerts[_batchId][_alertIndex];
        require(!alert.isResolved, "Alert already resolved");

        alert.isResolved = true;
        alert.resolution = _resolution;

        emit TemperatureAlertResolved(_batchId, alert.drugId, _resolution);
    }

    function getTemperatureAlerts(uint256 _batchId) 
        external 
        view 
        returns (TemperatureAlert[] memory) 
    {
        require(_batchId > 0, "Invalid batch ID");
        return temperatureAlerts[_batchId];
    }

    function getAlertCount(uint256 _batchId) external view returns (uint256) {
        require(_batchId > 0, "Invalid batch ID");
        return alertCount[_batchId];
    }

    function isTemperatureInRange(
        uint256 _drugId,
        uint256 _temperature
    ) external view returns (bool) {
        DrugRegistry.Drug memory drug = drugRegistry.getDrug(_drugId);
        
        if (!drug.requiresTemperatureControl) {
            return true;
        }

        return _temperature >= drug.minTemperature && _temperature <= drug.maxTemperature;
    }
} 