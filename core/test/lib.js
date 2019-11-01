module.exports.supressError = function supressError(message) {
  return (error) => {
    console.log(error.message);
    if (error.message !== message) {
      throw error;
    }
  };
};
