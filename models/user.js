const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '/default-profile.png' }, // URL to profile picture with default
    bio: { type: String, default: 'Tell us about yourself' }, // Default bio
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare hashed password with user input
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Update the user's profile information
userSchema.methods.updateProfile = async function (profilePicture, bio) {
    this.profilePicture = profilePicture || this.profilePicture;
    this.bio = bio || this.bio;
    await this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
