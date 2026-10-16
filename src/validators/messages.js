const minLengthMessage = (field, min) =>
  `${field} must be at least ${min} character(s)`;

const maxLengthMessage = (field, max) =>
  `${field} cannot exceed ${max} character(s)`;

module.exports = {
  minLengthMessage,
  maxLengthMessage,
};
