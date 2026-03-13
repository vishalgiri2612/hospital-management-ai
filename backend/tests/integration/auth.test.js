process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '24h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const request = require('supertest');
const bcrypt = require('bcryptjs');

// Mock database
jest.mock('../../src/config/database', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    define: jest.fn().mockReturnValue({}),
  },
  connectDB: jest.fn().mockResolvedValue(true),
}));

// Use a static bcrypt hash for 'password123' to avoid issues in mock factory scope
// Generated with: bcrypt.hashSync('password123', 12)
const MOCK_PASSWORD_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewA/eY7MG8K8Gp7K';

// Mock models
jest.mock('../../src/models', () => {
  const mockUser = {
    id: 'test-uuid-1',
    email: 'test@example.com',
    password: MOCK_PASSWORD_HASH,
    role: 'patient',
    is_active: true,
    last_login: null,
    refresh_token: null,
    update: jest.fn().mockResolvedValue(true),
  };

  return {
    User: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn().mockResolvedValue(mockUser),
    },
    Patient: {
      findOne: jest.fn().mockResolvedValue(null),
    },
    Doctor: {
      findOne: jest.fn().mockResolvedValue(null),
    },
    Appointment: { findAndCountAll: jest.fn() },
    MedicalRecord: { findAndCountAll: jest.fn() },
    Bill: { findAndCountAll: jest.fn() },
    InventoryItem: { findAndCountAll: jest.fn() },
    Staff: {},
  };
});

const { app } = require('../../src/app');
const { User } = require('../../src/models');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post('/api/auth/register').send({
        email: 'newuser@example.com',
        password: 'password123',
        role: 'patient',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should reject duplicate email', async () => {
      User.findOne.mockResolvedValue({ id: 'existing-id', email: 'existing@example.com' });

      const response = await request(app).post('/api/auth/register').send({
        email: 'existing@example.com',
        password: 'password123',
        role: 'patient',
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'not-an-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject short password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: 'test-uuid-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'patient',
        is_active: true,
        update: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should reject invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: 'test-uuid-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'patient',
        is_active: true,
        update: jest.fn(),
      };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });
});
