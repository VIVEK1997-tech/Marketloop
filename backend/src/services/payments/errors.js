export const createPaymentError = (message, statusCode = 400, code = 'PAYMENT_ERROR', details) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details) error.details = details;
  return error;
};
