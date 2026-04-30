import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { resolveUserRoles } from '../utils/roles.js';
import { sendError } from '../utils/apiResponse.js';

const getTokenFromHeader = (header = '') => (header.startsWith('Bearer ') ? header.split(' ')[1] : null);

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = getTokenFromHeader(header);

    if (!token) {
      return sendError(res, 'Authentication token is required', { statusCode: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.isBanned || user.accountStatus === 'deactivated') {
      return sendError(res, 'User is not authorized', { statusCode: 401 });
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', { statusCode: 401 });
  }
};

export const optionalProtect = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = getTokenFromHeader(header);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (user && !user.isBanned && user.accountStatus !== 'deactivated') {
      req.user = user;
    }

    next();
  } catch (_error) {
    next();
  }
};

export const authorize = (...roles) => (req, res, next) => {
  const userRoles = resolveUserRoles(req.user);
  if (!roles.some((role) => userRoles.includes(role))) {
    return sendError(res, 'You do not have permission to perform this action', { statusCode: 403 });
  }
  next();
};
