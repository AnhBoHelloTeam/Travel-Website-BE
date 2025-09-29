const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('profile.firstName')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('profile.lastName')
    .notEmpty()
    .trim()
    .withMessage('Last name is required'),
  body('profile.phone')
    .isString()
    .trim()
    .matches(/^\+?[0-9\s\-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['customer', 'business'])
    .withMessage('Role must be either customer or business'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Schedule validation
const validateSchedule = [
  body('routeId')
    .isMongoId()
    .withMessage('Valid route ID is required'),
  body('departureTime')
    .isISO8601()
    .withMessage('Valid departure time is required'),
  body('arrivalTime')
    .isISO8601()
    .withMessage('Valid arrival time is required'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('vehicleType')
    .isIn(['sitting', 'sleeping'])
    .withMessage('Vehicle type must be either sitting or sleeping'),
  handleValidationErrors
];

// Ticket booking validation
const validateTicketBooking = [
  body('scheduleId')
    .isMongoId()
    .withMessage('Valid schedule ID is required'),
  body('seatNumber')
    .notEmpty()
    .trim()
    .withMessage('Seat number is required'),
  body('passengerInfo.firstName')
    .notEmpty()
    .trim()
    .withMessage('Passenger first name is required'),
  body('passengerInfo.lastName')
    .notEmpty()
    .trim()
    .withMessage('Passenger last name is required'),
  body('passengerInfo.phone')
    .isString()
    .trim()
    .matches(/^\+?[0-9\s\-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('passengerInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('paymentInfo.method')
    .isIn(['momo', 'vnpay', 'cash'])
    .withMessage('Payment method must be momo, vnpay, or cash'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateSchedule,
  validateTicketBooking
};
