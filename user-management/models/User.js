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
    password: {
        type: String,
        required: true,
        trim: true
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
        type: String, // filename
        default: null // default value None
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId], // Array of user IDs (as strings)
        default: [] // Default to an empty array        
    }},
    {
        timestamps: true 
    }   
);

userSchema.statics.isExist = async function (email) {
    const user = await this.findOne({ email: email });
    return user ? user : false;
};

module.exports = mongoose.model('User', userSchema);
