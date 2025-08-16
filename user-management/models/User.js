
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    profilePhoto: {
        type: String // URL or file path
    }
}, {
    timestamps: true
});

userSchema.statics.isExist = async function (email) {
    const user = await this.findOne({ email: email });
    return user ? user : false;
};

module.exports = mongoose.model('User', userSchema);
