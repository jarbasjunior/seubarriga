module.exports = function ValidationError(error) {
  this.name = 'ValidationError';
  this.message = error.message;
  this.status = error.status;
};
