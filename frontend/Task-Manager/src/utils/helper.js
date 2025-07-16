export const validateEmail = (email) => {
  const Regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return Regex.test(email)
}

export const addThousandSeparator = (num) => {
  if (num == null || isNaN(num)) return ''

  const [integerPart, fractionalPart] = num.toString().split('.')
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger
}
