import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';
import { validationResult } from 'express-validator';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateCardNumber = async (prefix) => {
  let cardNumber;
  let isUnique = false;
  while (!isUnique) {
    cardNumber = prefix.toString();
    const remainingLength = 16 - cardNumber.length;
    for (let i = 0; i < remainingLength - 1; i++) {
      cardNumber += getRandomInt(0, 9);
    }
    let sum = 0;
    let isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    cardNumber += checkDigit;
    const existingCard = await UserModel.findOne({ 'userCards.cards.cardNumber': cardNumber });
    if (!existingCard) isUnique = true;
  }
  return cardNumber;
};

const generateExpirationDate = () => {
  const month = getRandomInt(1, 12).toString().padStart(2, '0');
  const year = getRandomInt(2026, 2032);
  return new Date(`${year}-${month}-01`);
};

const generateCVV = () => {
  return getRandomInt(0, 999).toString().padStart(3, '0');
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email or phone number already exists.',
      });
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const isVisa = Math.random() < 0.5;
    const cardPrefix = isVisa ? '4' : '54';
    const cardType = isVisa ? 'Visa' : 'Mastercard';

    const card = {
      cardNumber: await generateCardNumber(cardPrefix),
      cardHolderName: `${req.body.firstName} ${req.body.lastName}`.toUpperCase(),
      expirationDate: generateExpirationDate(),
      cvv: generateCVV(),
      type: cardType,
    };

    const doc = new UserModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      passwordHash: hash,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      userCards: { cards: [card] },
      userNotifications: {
        notifications: [{
          message: "Dear Customer, thank you for choosing our bank. A $10 bonus has been credited to your card.",
          date: new Date()
        }]
      },
      userTransactions: {
        transactions: [{
          amount: 10,
          type: "received",
          date: new Date()
        }]
      }
    });

    const user = await doc.save();

    const token = jwt.sign({ _id: user._id }, 'secret', {
      expiresIn: '10d',
    });

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to register',
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login route hit with body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      console.log('User not found for email:', req.body.email);
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      console.log('Invalid password for user:', req.body.email);
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign({ _id: user._id }, "secret", {
      expiresIn: '10d',
    });
    console.log('Generated token for user:', user._id);

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.error('Ошибка при входе:', err.message, err.stack);
    res.status(500).json({
      message: 'Failed to login',
      error: err.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    console.log('getMe called with userId:', req.userId);
    const user = await UserModel.findById(req.userId);

    if (!user) {
      console.log('User not found for ID:', req.userId);
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.error('Error in getMe:', err.message, err.stack);
    res.status(500).json({
      message: 'Failed to get user',
      error: err.message,
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const notifications = user.userNotifications.notifications;

    res.json(notifications);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to get notifications',
      error: err.message,
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const transactions = user.userTransactions.transactions;

    res.json(transactions);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to get transactions',
      error: err.message,
    });
  }
};