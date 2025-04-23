
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', (req, res) => {
    const token = jwt.sign({
        email: req.body.email,
        password: req.body.password
    }, 'secret');

    res.json({
        success: true,
        token
    });
});

export default router;