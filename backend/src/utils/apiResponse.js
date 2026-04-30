export const sendSuccess = (res, payload = {}, options = {}) => {
  const {
    statusCode = 200,
    message,
    meta,
    includeLegacy = true
  } = options;

  const body = {
    success: true,
    data: payload
  };

  if (includeLegacy && payload && typeof payload === 'object' && !Array.isArray(payload)) {
    Object.assign(body, payload);
  }

  if (message) body.message = message;
  if (meta !== undefined) body.meta = meta;

  return res.status(statusCode).json(body);
};

export const sendError = (res, error, options = {}) => {
  const {
    statusCode = 400,
    details,
    stack
  } = options;

  const body = {
    success: false,
    error,
    message: error
  };

  if (details !== undefined) body.details = details;
  if (stack !== undefined) body.stack = stack;

  return res.status(statusCode).json(body);
};
