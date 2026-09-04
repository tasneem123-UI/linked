const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true  // ✅ أضيفي sparse: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    photo: { type: String, default: '/default-avatar.png' },
    createdAt: { type: Date, default: Date.now }
});

// ✅ تشفير الرقم السري
userSchema.pre('save', function() {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    this.password = bcrypt.hashSync(this.password, 10);
});

// ✅ التحقق من الرقم السري
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);