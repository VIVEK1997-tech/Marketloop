import User from '../models/User.js';
import { generateToken } from '../utils/token.js';

const authResponse = (user) => ({
  token: generateToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profileImage: user.profileImage,
    location: user.location
  }
});

export const register = async (req, res) => {
  const { name, email, password, phone, role = 'buyer', location } = req.body;
  const exists = await User.findOne({ email });

  if (exists) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const user = await User.create({ name, email, password, phone, role, location });
  res.status(201).json(authResponse(user));
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.isBanned) {
    return res.status(403).json({ message: 'This account has been banned' });
  }

  res.json(authResponse(user));
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
