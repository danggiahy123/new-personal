const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot be more than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  esxiCredentials: {
    username: String,
    password: String, // Encrypted
    host: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Hash ESXi password if modified
userSchema.pre('save', async function(next) {
  if (this.isModified('esxiCredentials.password') && this.esxiCredentials.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.esxiCredentials.password = await bcrypt.hash(this.esxiCredentials.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compare ESXi password method
userSchema.methods.compareESXiPassword = async function(candidatePassword) {
  if (!this.esxiCredentials.password) return false;
  return await bcrypt.compare(candidatePassword, this.esxiCredentials.password);
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.esxiCredentials.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
