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
          date: new Date(),
          fromOrTo: "FinBank"
        }]
      }
    });

    const user = await doc.save();

    // Generate a new JWT for the newly created user
    const token = jwt.sign({ _