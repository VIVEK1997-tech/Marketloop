import User from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { serializeAuthUser } from '../utils/roles.js';
import { sendOtpEmail } from '../utils/sendEmail.js';

// OTPs stay valid for 10 minutes to reduce replay risk.
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const authResponse = (user) => ({
  token: generateToken(user._id),
  user: serializeAuthUser(user)
});

const buildOtpFields = () => ({
  otp: generateOtp(),
  otpExpiry: new Date(Date.now() + OTP_EXPIRY_MS)
});

const clearOtpFields = (user) => {
  user.otp = undefined;
  user.otpExpiry = undefined;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'buyer', location } = req.body;
    const existingUser = await User.findOne({ email }).select('+password +otp +otpExpiry');

    if (existingUser?.isVerified) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const otpFields = buildOtpFields();

    if (existingUser) {
      existingUser.name = name;
      existingUser.email = email;
      existingUser.password = password;
      existingUser.phone = phone ?? existingUser.phone ?? '';
      existingUser.roles = role === 'seller' ? ['buyer', 'seller'] : ['buyer'];
      existingUser.activeRole = role;
      existingUser.role = role;
      existingUser.location = location ?? existingUser.location;
      existingUser.isVerified = false;
      existingUser.otp = otpFields.otp;
      existingUser.otpExpiry = otpFields.otpExpiry;
      await existingUser.save();

      await sendOtpEmail({ email: existingUser.email, name: existingUser.name, otp: otpFields.otp });
      return res.status(200).json({ message: 'OTP sent to email', email: existingUser.email });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone ?? '',
      role,
      roles: role === 'seller' ? ['buyer', 'seller'] : ['buyer'],
      activeRole: role,
      location,
      isVerified: false,
      ...otpFields
    });

    await sendOtpEmail({ email: user.email, name: user.name, otp: otpFields.otp });
    return res.status(201).json({ message: 'OTP sent to email', email: user.email });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message || 'Could not register user' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.json({ message: 'Email is already verified' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'OTP not found. Please request a new code.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiry.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
    }

    user.isVerified = true;
    clearOtpFields(user);
    await user.save();

    return res.json({ message: 'Email verified successfully' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message || 'Could not verify OTP' });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const otpFields = buildOtpFields();
    user.otp = otpFields.otp;
    user.otpExpiry = otpFields.otpExpiry;
    await user.save();

    await sendOtpEmail({ email: user.email, name: user.name, otp: otpFields.otp });
    return res.json({ message: 'OTP sent to email', email: user.email });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message || 'Could not resend OTP' });
  }
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

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email first' });
  }

  res.json(authResponse(user));
};

export const me = async (req, res) => {
  res.json({ user: serializeAuthUser(req.user) });
};
