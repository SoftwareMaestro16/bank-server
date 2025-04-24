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
        notifications: [{
            date: {
                type: Date,
                default: Date.now
            },
            message: {
                type: String,
                required: true
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                auto: true
            }
        }]
    },
    userTransactions: {
        transactions: [{
            date: {
                type: Date,
                default: Date.now
            },
            amount: {
                type: Number,
                required: true
            },
            type: {
                type: String,
                enum: ['received', 'sent'],
                required: true
            },
            fromOrTo: {
                type: String,
                required: true
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                auto: true
            }
        }]
    }
}, {
    timestamps: true
});

export default mongoose.model("User", UserSchema);