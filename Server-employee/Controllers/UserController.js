
const User = require('../Models/UserModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
       // Create new user
       const newUser = new User({
          name,
          email,
          password: hashedPassword,
          role
        });
    
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role},
          process.env.SECRET_KEY,
      );

      // Do not include the password in the response
      const userWithoutPassword = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          
      };

      res.json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};
