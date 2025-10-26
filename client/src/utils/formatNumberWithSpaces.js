const formatNumberWithSpaces = (number = 0) => {
  const numberString = number.toString();
  const groups = [];
  for (let i = numberString.length; i > 0; i -= 3) {
    groups.unshift(numberString.substring(Math.max(0, i - 3), i));
  }

  return groups.join(" ");
};

export default formatNumberWithSpaces;
