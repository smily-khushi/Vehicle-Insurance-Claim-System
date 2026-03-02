import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'officer'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook: automatically hash password before storing in MongoDB
// Mongoose 9: async hooks should NOT use next(), just return/throw
userSchema.pre('save', async function () {
    // Only hash if the password field was new or modified
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export default model('User', userSchema);
