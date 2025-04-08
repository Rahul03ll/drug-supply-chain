const { ValidationError } = require('../middleware/errorMiddleware');

class Validator {
  // Predefined validation rules
  static RULES = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?(\d{10,14})$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    POSTAL_CODE: /^\d{5}(-\d{4})?$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  };

  // Middleware for route validation
  static validate(validationSchema) {
    return (req, res, next) => {
      const errors = this.validateData(
        { ...req.body, ...req.params, ...req.query }, 
        validationSchema
      );

      if (errors) {
        throw new ValidationError(errors);
      }

      next();
    };
  }

  // Comprehensive validation method
  static validateData(data, validationSchema) {
    const errors = {};

    Object.keys(validationSchema).forEach(field => {
      const value = data[field];
      const rules = validationSchema[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        return; // Skip further checks if field is missing
      }

      // Skip other checks if value is empty and not required
      if (!value && !rules.required) return;

      // Type checking
      if (rules.type) {
        switch (rules.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors[field] = `${field} must be a string`;
            }
            break;
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors[field] = `${field} must be a number`;
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors[field] = `${field} must be a boolean`;
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors[field] = `${field} must be an array`;
            }
            break;
        }
      }

      // Length validations
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must be no more than ${rules.maxLength} characters`;
      }

      // Pattern matching
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `${field} is in an invalid format`;
      }

      // Specific pattern shortcuts
      if (rules.email && !this.RULES.EMAIL.test(value)) {
        errors[field] = 'Invalid email format';
      }

      if (rules.phone && !this.RULES.PHONE.test(value)) {
        errors[field] = 'Invalid phone number';
      }

      // Range validations for numbers
      if (rules.min !== undefined && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
      }

      if (rules.max !== undefined && value > rules.max) {
        errors[field] = `${field} must be no more than ${rules.max}`;
      }

      // Custom validation function
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value, data);
        if (customError) {
          errors[field] = customError;
        }
      }
    });

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Sanitization methods
  static sanitize(data, sanitizationSchema) {
    const sanitizedData = { ...data };

    Object.keys(sanitizationSchema).forEach(field => {
      const rules = sanitizationSchema[field];

      if (rules.trim && typeof sanitizedData[field] === 'string') {
        sanitizedData[field] = sanitizedData[field].trim();
      }

      if (rules.lowercase && typeof sanitizedData[field] === 'string') {
        sanitizedData[field] = sanitizedData[field].toLowerCase();
      }

      if (rules.uppercase && typeof sanitizedData[field] === 'string') {
        sanitizedData[field] = sanitizedData[field].toUpperCase();
      }

      if (rules.type) {
        switch (rules.type) {
          case 'number':
            sanitizedData[field] = Number(sanitizedData[field]);
            break;
          case 'boolean':
            sanitizedData[field] = Boolean(sanitizedData[field]);
            break;
          case 'string':
            sanitizedData[field] = String(sanitizedData[field]);
            break;
        }
      }

      // Custom sanitization
      if (rules.custom && typeof rules.custom === 'function') {
        sanitizedData[field] = rules.custom(sanitizedData[field]);
      }
    });

    return sanitizedData;
  }

  // Predefined validation schemas
  static schemas = {
    userRegistration: {
      username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/
      },
      email: {
        required: true,
        email: true
      },
      password: {
        required: true,
        minLength: 8,
        pattern: this.RULES.PASSWORD
      },
      phone: {
        phone: true
      }
    },
    drugEntry: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      batchNumber: {
        required: true,
        pattern: /^[A-Z0-9]{6,12}$/
      },
      quantity: {
        required: true,
        type: 'number',
        min: 0,
        max: 10000
      }
    }
  };
}

module.exports = Validator;
