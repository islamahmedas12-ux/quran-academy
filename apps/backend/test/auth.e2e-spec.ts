import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/magic-link (POST)', () => {
    it('should generate magic link for valid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/magic-link')
        .send({ email: 'test@example.com' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('expiresAt');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/magic-link')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/magic-link')
        .send({})
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/magic-link')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('/auth/verify (GET)', () => {
    it('should verify valid magic link and return tokens', async () => {
      const generateResponse = await request(app.getHttpServer())
        .post('/auth/magic-link')
        .send({ email: 'test@example.com' });

      const token = generateResponse.body.data.token;

      const verifyResponse = await request(app.getHttpServer())
        .get('/auth/verify')
        .query({ token })
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.data).toHaveProperty('accessToken');
      expect(verifyResponse.body.data).toHaveProperty('refreshToken');
      expect(verifyResponse.body.data).toHaveProperty('expiresIn');
      expect(verifyResponse.body.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 400 for invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/verify')
        .query({ token: 'invalid-token' })
        .expect(400);
    });

    it('should return 400 for missing token', async () => {
      await request(app.getHttpServer())
        .get('/auth/verify')
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should return new access token for valid refresh token', async () => {
      const generateResponse = await request(app.getHttpServer())
        .post('/auth/magic-link')
        .send({ email: 'test@example.com' });

      const token = generateResponse.body.data.token;

      const verifyResponse = await request(app.getHttpServer())
        .get('/auth/verify')
        .query({ token });

      const refreshToken = verifyResponse.body.data.refreshToken;

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data).toHaveProperty('accessToken');
      expect(refreshResponse.body.data).toHaveProperty('expiresIn');
    });

    it('should return 400 for invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(400);
    });

    it('should return 400 for missing refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully with valid token', async () => {
      const generateResponse = await request(app.getHttpServer())
        .post('/auth/magic-link')
        .send({ email: 'test@example.com' });

      const token = generateResponse.body.data.token;

      const verifyResponse = await request(app.getHttpServer())
        .get('/auth/verify')
        .query({ token });

      const accessToken = verifyResponse.body.data.accessToken;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
    });

    it('should return 401 without authorization header', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
