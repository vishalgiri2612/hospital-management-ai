/**
 * Generate a unique ID with a prefix
 * @param {string} prefix - e.g. 'PAT', 'DOC', 'APT'
 * @returns {string}
 */
const generateUniqueId = (prefix) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Calculate age from date of birth
 * @param {Date|string} dateOfBirth
 * @returns {number}
 */
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Format currency
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Paginate results
 * @param {number} page
 * @param {number} limit
 * @returns {{ offset: number, limit: number }}
 */
const getPagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (parsedPage - 1) * parsedLimit;
  return { offset, limit: parsedLimit };
};

/**
 * Build paginated response
 */
const paginatedResponse = (data, count, page, limit) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  return {
    data,
    pagination: {
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    },
  };
};

module.exports = {
  generateUniqueId,
  calculateAge,
  formatCurrency,
  getPagination,
  paginatedResponse,
};
