import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import jwt from 'jsonwebtoken'

describe('App bootstrap (e2e)', () => {
  let app: INestApplication<App>;
  let tokenSimulado: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    tokenSimulado = jwt.sign(
      { sub: 1, email: 'test@gmail.com' },
      'secret',
      { expiresIn: '1h'}
    )
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return at leat one user, but with that exact structure', () => {
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

  if('GET /users protected with a token', () => {
    return request(app.getHttpServer())
    .get('/users')
    .set('Authorization', `Bearer ${tokenSimulado}`)
    .expect(200)
  })

  it('should post a user', () => {
    return request(app.getHttpServer()).post('/users')
    .send({name: 'Bryan', email: 'example.com'}).expect(201);
  });

  it('should return code 404 if the user was not found', () => {
    return request(app.getHttpServer()).get(`/users/999`).expect(404);
  });

  it('should get a user by id', () => {
    return request(app.getHttpServer()).get(`/users/1`).expect(200);
  });

  it('should put a user', () => {
    return request(app.getHttpServer()).put('/users/1')
    .send({name: 'Bryan Updated', email: 'example2.com'}).expect(200);
  });

  it('should soft delete a user', () => {
    return request(app.getHttpServer()).delete(`/users/1`).expect(200);
  });
});
