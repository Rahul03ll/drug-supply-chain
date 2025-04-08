const express = require('express');
const router = express.Router();
const Validator = require('../middleware/validationMiddleware');
const { ValidationError } = require('../middleware/errorMiddleware');
const DrugController = require('../controllers/drugController');
const Web3 = require('web3');

// Initialize Web3 for drug controller
const web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
DrugController.initializeWeb3(web3Provider);

// Validation middleware for drug entry
router.post('/entry', 
  Validator.validate({
    name: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    manufacturer: {
      required: true,
      minLength: 2,
      maxLength: 100
    }
  }),
  async (req, res, next) => {
    try {
      // Sanitize input
      const sanitizedData = Validator.sanitize(req.body, {
        name: { trim: true },
        manufacturer: { trim: true }
      });

      // Merge sanitized data with original request body
      req.body = { ...req.body, ...sanitizedData };

      // Proceed with drug entry
      await DrugController.createDrugEntry(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Get all drugs
router.get('/', async (req, res, next) => {
  await DrugController.getDrugs(req, res, next);
});

module.exports = router;
