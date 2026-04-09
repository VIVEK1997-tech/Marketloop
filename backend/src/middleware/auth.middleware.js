import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { resolveUserRoles } from '../utils/roles.js';

const getTokenFromHeader = (header = '') => (header.startsWith('Bearer ') ? header.split(' ')[1] : null);

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = getTokenFromHeader(header);

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.isBanned) {
      return res.status(401).json({ message: 'User is not authorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
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

    if (user && !user.isBanned) {
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
    return res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
  next();
};
