module.exports.supressError = function supressError(message) {
  return (error) => {
    if (error.message !== message) {
      throw error;
    }
  };
};
