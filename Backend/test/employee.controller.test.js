const request = require('supertest');
const app = require('../server');

// Mock the models
jest.mock('../models', () => {
  const mockEmployee = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    position: 'Developer',
    departmentId: 1,
    hireDate: new Date(),
    status: 'active',
    toJSON: function() {
      return {
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        position: this.position,
        departmentId: this.departmentId,
        hireDate: this.hireDate,
        status: this.status
      };
    }
  };

  return {
    Employee: {
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where.id === 1) {
          return Promise.resolve(mockEmployee);
        }
        return Promise.resolve(null);
      }),
      findAll: jest.fn().mockResolvedValue([mockEmployee]),
      create: jest.fn().mockImplementation((data) => 
        Promise.resolve({ id: 2, ...data })
      ),
      update: jest.fn().mockImplementation((data, { where }) => {
        if (where.id === 1) {
          return Promise.resolve([1, [mockEmployee]]);
        }
        return Promise.resolve([0, []]);
      }),
      destroy: jest.fn().mockResolvedValue(1)
    },
    Department: {
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'IT' })
    }
  };
});

describe('Employee Controller', () => {
  // Mock authentication middleware
  const mockAuth = (req, res, next) => {
    req.user = { id: 1, role: 'Admin' };
    next();
  };

  // Apply mock auth to all routes
  beforeAll(() => {
    const employeeRoutes = require('../employees/employees.routes');
    app.use('/api/employees', mockAuth, employeeRoutes);
  });

  describe('GET /api/employees', () => {
    it('should get all employees', async () => {
      const res = await request(app)
        .get('/api/employees')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should get employee by id', async () => {
      const res = await request(app)
        .get('/api/employees/1')
        .expect(200);

      expect(res.body).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent employee', async () => {
      await request(app)
        .get('/api/employees/999')
        .expect(404);
    });
  });

  describe('POST /api/employees', () => {
    it('should create a new employee', async () => {
      const newEmployee = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        position: 'Designer',
        departmentId: 1,
        hireDate: new Date().toISOString(),
        status: 'active'
      };

      const res = await request(app)
        .post('/api/employees')
        .send(newEmployee)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.firstName).toBe(newEmployee.firstName);
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('should update an employee', async () => {
      const updates = {
        position: 'Senior Developer'
      };

      const res = await request(app)
        .put('/api/employees/1')
        .send(updates)
        .expect(200);

      expect(res.body).toHaveProperty('position', updates.position);
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should delete an employee', async () => {
      await request(app)
        .delete('/api/employees/1')
        .expect(200);
    });
  });
});
