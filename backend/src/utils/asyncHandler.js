export const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    if (error.statusCode && res.statusCode === 200) {
      res.status(error.statusCode);
    }
    next(error);
  }
};
