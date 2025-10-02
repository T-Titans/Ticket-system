export const register = async (req, res) => {
  console.log('🔵 REGISTER endpoint hit', req.body); // Add this line
  
  const { name, email, password } = req.body;
  try {
    console.log('🟡 Checking for existing user:', email);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('🟡 Creating new user');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'user' });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log('🟢 User registered successfully:', user.email);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('🔴 Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};