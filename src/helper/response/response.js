const messages = require("./message");

exports.success = (res, code = null, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    message: messages.getMessage(code),
    ...(data !== null && { data }),
  });
};

exports.error = (res, code = null, status = 400) => {
  return res.status(status).json({
    success: false,
    message: messages.getMessage(code),
  });
};
