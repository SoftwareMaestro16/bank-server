import { body } from 'express-validator';

export const registerValidation = [
    body('firstName', 'Full name is required').isLength({ min: 1 }),
    body('lastName', 'Full name is required').isLength({ min: 1 }),
    body('email', 'Invalid email format').isEmail(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    body('address', 'Address is required').isLength({ min: 1 }),
    body('phoneNumber', 'Phone number is required').isLength({ min: 1 }),
]