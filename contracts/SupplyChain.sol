// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./DrugRegistry.sol";

contract SupplyChain is AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _batchIds;

    DrugRegistry public drugRegistry;

    struct Batch {
        uint256 id;
        uint256 drugId;
        uint256 quantity;
        address manufacturer;
        address currentHolder;
        uint256 timestamp;
        string location;
        uint256 temperature;
        bool isActive;
    }

    struct Transfer {
        uint256 batchId;
        address from;
        address to;
        uint256 timestamp;
        string location;
        uint256 temperature;
    }

    mapping(uint256 => Batch) public batches;
    mapping(uint256 => Transfer[]) public transferHistory;
    mapping(uint256 => uint256) public batchCount;

    event BatchCreated(
        uint256 indexed batchId,
        uint256 indexed drugId,
        uint256 quantity,
        address indexed manufacturer
    );

    event BatchTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to
    );

    event TemperatureUpdated(
        uint256 indexed batchId,
        uint256 temperature,
        string location
    );

    constructor(address _drugRegistry) {
        drugRegistry = DrugRegistry(_drugRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createBatch(
        uint256 _drugId,
        uint256 _quantity,
        string memory _location
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(_quantity > 0, "Quantity must be greater than 0");
        
        _batchIds.increment();
        uint256 newBatchId = _batchIds.current();

        batches[newBatchId] = Batch({
            id: newBatchId,
            drugId: _drugId,
            quantity: _quantity,
            manufacturer: msg.sender,
            currentHolder: msg.sender,
            timestamp: block.timestamp,
            location: _location,
            temperature: 0,
            isActive: true
        });

        batchCount[_drugId]++;

        emit BatchCreated(newBatchId, _drugId, _quantity, msg.sender);
        return newBatchId;
    }

    function transferBatch(
        uint256 _batchId,
        address _to,
        string memory _location,
        uint256 _temperature
    ) external {
        require(_batchId > 0 && _batchId <= _batchIds.current(), "Invalid batch ID");
        require(_to != address(0), "Invalid recipient address");
        
        Batch storage batch = batches[_batchId];
        require(batch.isActive, "Batch is not active");
        require(batch.currentHolder == msg.sender, "Not the current holder");

        batch.currentHolder = _to;
        batch.timestamp = block.timestamp;
        batch.location = _location;
        batch.temperature = _temperature;

        transferHistory[_batchId].push(Transfer({
            batchId: _batchId,
            from: msg.sender,
            to: _to,
            timestamp: block.timestamp,
            location: _location,
            temperature: _temperature
        }));

        emit BatchTransferred(_batchId, msg.sender, _to);
        emit TemperatureUpdated(_batchId, _temperature, _location);
    }

    function updateTemperature(
        uint256 _batchId,
        uint256 _temperature,
        string memory _location
    ) external {
        require(_batchId > 0 && _batchId <= _batchIds.current(), "Invalid batch ID");
        
        Batch storage batch = batches[_batchId];
        require(batch.isActive, "Batch is not active");
        require(batch.currentHolder == msg.sender, "Not the current holder");

        batch.temperature = _temperature;
        batch.location = _location;
        batch.timestamp = block.timestamp;

        emit TemperatureUpdated(_batchId, _temperature, _location);
    }

    function getBatch(uint256 _batchId) external view returns (Batch memory) {
        require(_batchId > 0 && _batchId <= _batchIds.current(), "Invalid batch ID");
        return batches[_batchId];
    }

    function getTransferHistory(uint256 _batchId) external view returns (Transfer[] memory) {
        require(_batchId > 0 && _batchId <= _batchIds.current(), "Invalid batch ID");
        return transferHistory[_batchId];
    }

    function getBatchCount(uint256 _drugId) external view returns (uint256) {
        return batchCount[_drugId];
    }
} 