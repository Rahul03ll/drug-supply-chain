// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./DrugRegistry.sol";

contract SupplyChain is AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _batchIds;

    DrugRegistry public drugRegistry;

    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");

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
        address indexed to,
        string location,
        uint256 temperature
    );

    event BatchDeactivated(uint256 indexed batchId, address indexed admin);

    constructor(address _drugRegistry) {
        drugRegistry = DrugRegistry(_drugRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createBatch(
        uint256 _drugId,
        uint256 _quantity,
        string memory _location,
        uint256 _temperature
    ) external onlyRole(MANUFACTURER_ROLE) returns (uint256) {
        require(_quantity > 0, "Quantity must be greater than 0");
        require(drugRegistry.getDrugCount() >= _drugId, "Invalid drug ID");

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
            temperature: _temperature,
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
        require(_to != address(0), "Invalid recipient address");
        require(batches[_batchId].id == _batchId, "Batch does not exist");

        Batch storage batch = batches[_batchId];
        require(batch.isActive, "Batch is not active");
        require(batch.currentHolder == msg.sender, "Not the current holder");

        Transfer memory transfer = Transfer({
            batchId: _batchId,
            from: msg.sender,
            to: _to,
            timestamp: block.timestamp,
            location: _location,
            temperature: _temperature
        });

        transferHistory[_batchId].push(transfer);
        batch.currentHolder = _to;
        batch.location = _location;
        batch.temperature = _temperature;
        batch.timestamp = block.timestamp;

        emit BatchTransferred(_batchId, msg.sender, _to, _location, _temperature);
    }

    function getBatchTransferHistory(uint256 _batchId)
        external
        view
        returns (Transfer[] memory)
    {
        require(batches[_batchId].id == _batchId, "Batch does not exist");
        return transferHistory[_batchId];
    }

    function deactivateBatch(uint256 _batchId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(batches[_batchId].id == _batchId, "Batch does not exist");
        require(batches[_batchId].isActive, "Batch is already inactive");

        batches[_batchId].isActive = false;
        emit BatchDeactivated(_batchId, msg.sender);
    }

    function getBatchCount() external view returns (uint256) {
        return _batchIds.current();
    }
}
