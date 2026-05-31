import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Users API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── GET /users ──────────────────────────────────────────────────────────────

  describe('GET /users', () => {
    it('should return HTTP status 200', () => {
      return request(app.getHttpServer()).get('/users').expect(200);
    });

    it('should return an array', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return at least one user with the correct structure', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeGreaterThan(0);
          const user = res.body[0];
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('email');
        });
    });

    it('should include the seeded user Jorge', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          const jorge = res.body.find(
            (u: { name: string }) => u.name === 'Jorge',
          );
          expect(jorge).toBeDefined();
          expect(jorge.email).toBe('jorge@test.com');
        });
    });
  });

  // ─── GET /users/:id ──────────────────────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('should return HTTP status 200 for an existing user', () => {
      return request(app.getHttpServer()).get('/users/1').expect(200);
    });

    it('should return the correct user for id=1', () => {
      return request(app.getHttpServer())
        .get('/users/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: 1,
            name: 'Jorge',
            email: 'jorge@test.com',
          });
        });
    });

    it('should return HTTP status 404 for a non-existent user', () => {
      return request(app.getHttpServer()).get('/users/9999').expect(404);
    });

    it('should return HTTP status 400 for a non-numeric id', () => {
      return request(app.getHttpServer()).get('/users/abc').expect(400);
    });
  });

  // ─── POST /users ─────────────────────────────────────────────────────────────

  describe('POST /users', () => {
    it('should return HTTP status 201', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Maria', email: 'maria@test.com' })
        .expect(201);
    });

    it('should return the newly created user with an id assigned', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Maria', email: 'maria@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(res.body.name).toBe('Maria');
          expect(res.body.email).toBe('maria@test.com');
        });
    });

    it('should persist the created user and make it retrievable via GET /users', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Carlos', email: 'carlos@test.com' })
        .expect(201);

      const { id } = createRes.body;

      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          const found = res.body.find((u: { id: number }) => u.id === id);
          expect(found).toBeDefined();
          expect(found.name).toBe('Carlos');
        });
    });

    it('should make the created user retrievable via GET /users/:id', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Ana', email: 'ana@test.com' })
        .expect(201);

      const { id } = createRes.body;

      return request(app.getHttpServer())
        .get(`/users/${id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id,
            name: 'Ana',
            email: 'ana@test.com',
          });
        });
    });
  });
});
