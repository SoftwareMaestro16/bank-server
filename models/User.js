import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    userCards: {
        cards: [{
            cardNumber: {
                type: String,
                required: true
            },
            cardHolderName: {
                type: String,
                required: true
            },
            expirationDate: {
                type: Date,
                required: true
            },
            cvv: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            }
        }]
    }}, {
        timestamps: true
    })

export default mongoose.model("User", UserSchema);