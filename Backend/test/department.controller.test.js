const request = require('supertest');
const app = require('../server');

// Mock the models
jest.mock('../models', () => {
  const mockDepartment = {
    id: 1,
    name: 'IT',
    description: 'Information Technology Department',
    employeeCount: 5,
    toJSON: function() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        employeeCount: this.employeeCount
      };
    }
  };

  return {
    Department: {
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where.id === 1) {
          return Promise.resolve(mockDepartment);
        }
        return Promise.resolve(null);
      }),
      findAll: jest.fn().mockResolvedValue([mockDepartment]),
      create: jest.fn().mockImplementation((data) => 
        Promise.resolve({ id: 2, ...data })
      ),
      update: jest.fn().mockImplementation((data, { where }) => {
        if (where.id === 1) {
          return Promise.resolve([1, [mockDepartment]]);
        }
        return Promise.resolve([0, []]);
      }),
      destroy: jest.fn().mockResolvedValue(1),
      count: jest.fn().mockResolvedValue(5)
    },
    Employee: {
      count: jest.fn().mockResolvedValue(5)
    }
  };
});

describe('Department Controller', () => {
  // Mock authentication middleware
  const mockAuth = (req, res, next) => {
    req.user = { id: 1, role: 'Admin' };
    next();
  };

  // Apply mock auth to all routes
  beforeAll(() => {
    const departmentRoutes = require('../departments/departments.routes');
    app.use('/api/departments', mockAuth, departmentRoutes);
  });

  describe('GET /api/departments', () => {
    it('should get all departments', async () => {
      const res = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/departments/:id', () => {
    it('should get department by id', async () => {
      const res = await request(app)
        .get('/api/departments/1')
        .expect(200);

      expect(res.body).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent department', async () => {
      await request(app)
        .get('/api/departments/999')
        .expect(404);
    });
  });

  describe('POST /api/departments', () => {
    it('should create a new department', async () => {
      const newDepartment = {
        name: 'HR',
        description: 'Human Resources Department'
      };

      const res = await request(app)
        .post('/api/departments')
        .send(newDepartment)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newDepartment.name);
    });
  });

  describe('PUT /api/departments/:id', () => {
    it('should update a department', async () => {
      const updates = {
        description: 'Updated IT Department'
      };

      const res = await request(app)
        .put('/api/departments/1')
        .send(updates)
        .expect(200);

      expect(res.body).toHaveProperty('description', updates.description);
    });
  });

  describe('DELETE /api/departments/:id', () => {
    it('should delete a department', async () => {
      await request(app)
        .delete('/api/departments/1')
        .expect(200);
    });
  });
});
