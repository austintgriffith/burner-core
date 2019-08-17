const { toBN } = require('web3-utils');

function toDecimal(weiInput, decimals) {
  const wei = toBN(weiInput.toString());
  const base = toBN('10').pow(toBN(decimals.toString()));
  const baseLength = base.toString().length - 1 || 1;

  let fraction = wei.mod(base).toString(10);

  while (fraction.length < baseLength) {
    fraction = `0${fraction}`;
  }
  fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1]

  const whole = wei.div(base).toString(10);
  const value = `${whole}${fraction == '0' ? '' : `.${fraction}`}`;
  return value;
}

module.exports.toDecimal = toDecimal;
