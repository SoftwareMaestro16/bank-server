import mongoose from "mongoose";

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
            },
            balance: {
                type: Number,
                required: true,
                default: 10
            }
        }]
    },
    userNotifications: {
        notifications: {
            type: [{
                date: { type: Date, default: Date.now },
                message: { type: String }
            }],
            default: () => [{
                message: "Dear Customer, thank you for choosing our bank. A $10 bonus has been credited to your card.",
                date: new Date()
            }]
        }
    },
    userTransactions: {
        transactions: {
            type: [{
                date: { type: Date, default: Date.now },
                amount: { type: Number, required: true },
                type: { type: String, enum: ["received", "sent"], required: true }
            }],
            default: () => [{
                amount: 10,
                type: "received",
                date: new Date()
            }]
        }
    }
}, {
    timestamps: true
});

export default mongoose.model("User", UserSchema);