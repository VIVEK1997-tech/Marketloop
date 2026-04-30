import User from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { serializeAuthUser } from '../utils/roles.js';
import { sendOtpEmail } from '../utils/sendEmail.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

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
  const { name, email, password, phone, role = 'buyer', location } = req.body;
  const existingUser = await User.findOne({ email }).select('+password +otp +otpExpiry');

  if (existingUser?.isVerified) {
    return sendError(res, 'Email is already registered', { statusCode: 409 });
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
    return sendSuccess(res, { email: existingUser.email }, {
      statusCode: 200,
      message: 'OTP sent to email'
    });
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
  return sendSuccess(res, { email: user.email }, {
    statusCode: 201,
    message: 'OTP sent to email'
  });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpiry');

  if (!user) {
    return sendError(res, 'User not found', { statusCode: 404 });
  }

  if (user.isVerified) {
    return sendSuccess(res, {}, { message: 'Email is already verified' });
  }

  if (!user.otp || !user.otpExpiry) {
    return sendError(res, 'OTP not found. Please request a new code.', { statusCode: 400 });
  }

  if (user.otp !== otp) {
    return sendError(res, 'Invalid OTP', { statusCode: 400 });
  }

  if (user.otpExpiry.getTime() < Date.now()) {
    return sendError(res, 'OTP has expired. Please request a new code.', { statusCode: 400 });
  }

  user.isVerified = true;
  clearOtpFields(user);
  await user.save();

  return sendSuccess(res, {}, { message: 'Email verified successfully' });
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpiry');

  if (!user) {
    return sendError(res, 'User not found', { statusCode: 404 });
  }

  if (user.isVerified) {
    return sendError(res, 'Email is already verified', { statusCode: 400 });
  }

  const otpFields = buildOtpFields();
  user.otp = otpFields.otp;
  user.otpExpiry = otpFields.otpExpiry;
  await user.save();

  await sendOtpEmail({ email: user.email, name: user.name, otp: otpFields.otp });
  return sendSuccess(res, { email: user.email }, { message: 'OTP sent to email' });
};

export const login = async (req, res) => {
  const { email, password, role: selectedRole } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return sendError(res, 'Invalid email or password', { statusCode: 401 });
  }

  if (user.isBanned) {
    return sendError(res, 'This account has been banned', { statusCode: 403 });
  }

  if (!user.isVerified) {
    return sendError(res, 'Please verify your email first', { statusCode: 403 });
  }

  const storedRole = user.activeRole || user.role || 'buyer';
  if (selectedRole && selectedRole !== 'admin' && selectedRole !== storedRole) {
    const normalizedRole = storedRole === 'seller' ? 'Seller' : storedRole === 'admin' ? 'Admin' : 'Buyer';
    return sendError(res, `You are registered as a ${normalizedRole}. Please login as ${normalizedRole}.`, { statusCode: 403 });
  }

  if (selectedRole && selectedRole !== 'admin') {
    user.activeRole = selectedRole;
    user.role = selectedRole;
    await user.save();
  }

  return sendSuccess(res, authResponse(user));
};

export const me = async (req, res) => {
  return sendSuccess(res, { user: serializeAuthUser(req.user) });
};
