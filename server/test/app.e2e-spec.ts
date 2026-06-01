import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { retry } from 'rxjs';

describe('App bootstrap (e2e)', () => {
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

  it('should initialise and expose the /users route', () => {
    return request(app.getHttpServer()).get('/users').expect(200);
  });

  it('should post a user', () => {
    return request(app.getHttpServer()).post('/users')
    .send({name: 'Bryan', email: 'example.com'}).expect(201);
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
