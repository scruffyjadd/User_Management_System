const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../server');
const { User, Role } = require('../models');

// Mock data
const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: '$2a$10$XFD9P/LzQ7zA1sKk5Xm5QO9vZJ9Vd8XeJ9Vc8xY7z6y5w4v3b2n1m', // hashed 'password123'
  firstName: 'Test',
  lastName: 'User',
  role: 'User',
  isVerified: true,
  comparePassword: jest.fn().mockImplementation((password) => {
    return password === 'password123';
  }),
  save: jest.fn().mockResolvedValue(true),
  toJSON: function() {
    const { password, ...user } = this;
    return user;
  }
};

// Mock the models
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Setup User model mocks
  User.findOne.mockImplementation(({ where }) => {
    if (where.email === 'test@example.com') {
      return Promise.resolve(mockUser);
    }
    return Promise.resolve(null);
  });
  
  User.create.mockResolvedValue({
    ...mockUser,
    id: 2,
    email: 'new@example.com'
  });
  
  // Setup Role model mock
  Role.findOne.mockResolvedValue({ id: 1, name: 'User' });
  
  // Setup JWT mock
  jwt.sign.mockReturnValue('mocked-jwt-token');
  jwt.verify.mockReturnValue({ id: 1, role: 'User' });
  
  // Setup bcrypt mock
  bcrypt.compare.mockImplementation((password) => {
    return password === 'password123';
  });
  
  bcrypt.hash.mockResolvedValue('hashed-password');
});

describe('Auth Controller', () => {
  describe('POST /api/accounts/authenticate', () => {
    it('should authenticate user with valid credentials', async () => {
      mockUser.comparePassword.mockResolvedValue(true);
      
      const res = await request(app)
        .post('/api/accounts/authenticate')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      mockUser.comparePassword.mockResolvedValue(false);
      
      await request(app)
        .post('/api/accounts/authenticate')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  describe('POST /api/accounts/register', () => {
    it('should register a new user', async () => {
      // Mock that user doesn't exist yet
      User.findOne.mockResolvedValueOnce(null);
      
      const res = await request(app)
        .post('/api/accounts/register')
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'new@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('message');
      expect(User.create).toHaveBeenCalled();
    });

    it('should return 400 for existing email', async () => {
      // Mock that user already exists
      User.findOne.mockResolvedValueOnce(mockUser);
      
      await request(app)
        .post('/api/accounts/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        })
        .expect(400);
    });
  });
});
