import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
    console.log('Register route hit with body:', req.body);

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
    
        const doc = new UserModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            passwordHash: hash,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
        })
    
        const user = await doc.save();

        const token = jwt.sign({
            _id: user._id
        }, 'secret', { expiresIn: 70 });

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token
        });

    } catch (err) {
        console.error('Ошибка при регистрации:', err.message, err.stack); // Подробный лог
        return res.status(500).json({
            message: 'Failded to register',
            error: err.message
        });
    }
}

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: 'Invalid password or email'
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Invalid password or email'
            })
        }

        const token = jwt.sign({
            _id: user._id
        }, 'secret', { expiresIn: 70 });

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Failed to login'
        })
    }
}

export const getMe = async (req, res) => {

    try {
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const { passwordHash, ...userData } = user._doc;

        res.json(userData);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Failed to get user'
        })
    }
}