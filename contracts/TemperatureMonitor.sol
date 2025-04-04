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

    struct BatchTemp {
        uint256 minTemp;
        uint256 maxTemp;
        bool requiresControl;
    }

    mapping(uint256 => TemperatureAlert[]) public temperatureAlerts;
    mapping(uint256 => uint256) public alertCount;
    uint256 public totalActiveAlerts;

    event TemperatureAlertCreated(
        uint256 indexed batchId,
        uint256 indexed drugId,
        uint256 temperature,
        string location
    );

    event TemperatureAlertResolved(
        uint256 indexed batchId,
        uint256 indexed drugId,
        uint256 indexed alertIndex,
        string resolution,
        address resolvedBy
    );

    constructor(address _drugRegistry, address _supplyChain) {
        drugRegistry = DrugRegistry(_drugRegistry);
        supplyChain = SupplyChain(_supplyChain);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function _getDrugTempLimits(uint256 _drugId) internal view returns (BatchTemp memory) {
        (bool exists, uint256 minTemp, uint256 maxTemp, bool requiresControl) = 
            drugRegistry.getTemperatureLimits(_drugId);
        
        require(exists, "Drug does not exist");
        return BatchTemp(minTemp, maxTemp, requiresControl);
    }

    function checkTemperature(
        uint256 _batchId,
        uint256 _temperature,
        string memory _location
    ) external {
        require(_batchId > 0, "Invalid batch ID");
        (uint256 id, uint256 drugId, ,,,,,, bool isActive) = supplyChain.batches(_batchId);
        require(id == _batchId && isActive, "Batch does not exist");

        BatchTemp memory tempLimits = _getDrugTempLimits(drugId);

        if (tempLimits.requiresControl) {
            if (_temperature < tempLimits.minTemp || _temperature > tempLimits.maxTemp) {
                TemperatureAlert memory alert = TemperatureAlert({
                    batchId: _batchId,
                    drugId: drugId,
                    temperature: _temperature,
                    timestamp: block.timestamp,
                    location: _location,
                    isResolved: false,
                    resolution: ""
                });

                temperatureAlerts[_batchId].push(alert);
                alertCount[_batchId]++;
                totalActiveAlerts++;

                emit TemperatureAlertCreated(_batchId, drugId, _temperature, _location);
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
        totalActiveAlerts--;

        emit TemperatureAlertResolved(_batchId, alert.drugId, _alertIndex, _resolution, msg.sender);
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

    function getActiveAlerts() external view returns (uint256) {
        return totalActiveAlerts;
    }
}
