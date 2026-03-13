const { calculateAge, generateUniqueId, getPagination, paginatedResponse } = require('../../src/utils/helpers');

describe('Helper Functions', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      expect(calculateAge(birthDate)).toBe(30);
    });

    it('should handle string date input', () => {
      const age = calculateAge('1990-01-01');
      expect(age).toBeGreaterThan(30);
    });
  });

  describe('generateUniqueId', () => {
    it('should generate ID with given prefix', () => {
      const id = generateUniqueId('PAT');
      expect(id).toMatch(/^PAT-/);
    });

    it('should generate unique IDs', () => {
      const id1 = generateUniqueId('DOC');
      const id2 = generateUniqueId('DOC');
      expect(id1).not.toBe(id2);
    });
  });

  describe('getPagination', () => {
    it('should return default pagination values', () => {
      const { offset, limit } = getPagination();
      expect(offset).toBe(0);
      expect(limit).toBe(10);
    });

    it('should calculate correct offset', () => {
      const { offset, limit } = getPagination(3, 10);
      expect(offset).toBe(20);
      expect(limit).toBe(10);
    });

    it('should cap limit at 100', () => {
      const { limit } = getPagination(1, 200);
      expect(limit).toBe(100);
    });

    it('should handle invalid page number', () => {
      const { offset } = getPagination(0, 10);
      expect(offset).toBe(0);
    });
  });

  describe('paginatedResponse', () => {
    it('should return correct pagination metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = paginatedResponse(data, 25, 2, 10);

      expect(result.data).toEqual(data);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(3);
    });
  });
});
