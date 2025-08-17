class HttpError extends Error {
  statusCode
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype); // 👈 Required for instanceof to work
  }
}
module.exports = HttpError