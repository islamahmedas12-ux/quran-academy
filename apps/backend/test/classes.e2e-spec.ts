import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('ClassesController (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let teacherToken: string;
  let studentId: string;
  let teacherId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const studentResponse = await request(app.getHttpServer())
      .post('/auth/magic-link')
      .send({ email: 'student@example.com' });
    const studentTokenResult = await request(app.getHttpServer())
      .get('/auth/verify')
      .query({ token: studentResponse.body.data.token });
    studentToken = studentTokenResult.body.data.accessToken;
    studentId = studentTokenResult.body.data.user.id;

    const teacherResponse = await request(app.getHttpServer())
      .post('/auth/magic-link')
      .send({ email: 'teacher@example.com' });
    const teacherTokenResult = await request(app.getHttpServer())
      .get('/auth/verify')
      .query({ token: teacherResponse.body.data.token });
    teacherToken = teacherTokenResult.body.data.accessToken;
    teacherId = teacherTokenResult.body.data.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/classes (POST)', () => {
    it('should book a class successfully', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      const endDate = new Date(Date.now() + 90000000);

      const response = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: futureDate.toISOString(),
          endTime: endDate.toISOString(),
          topic: 'Quran Reading Practice',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('jitsiRoom');
      expect(response.body.jitsiRoom).toMatch(/^quran-academy-/);
    });

    it('should return 400 for invalid time range', async () => {
      const pastDate = new Date(Date.now() - 86400000);

      await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: pastDate.toISOString(),
          endTime: new Date(Date.now() - 82800000).toISOString(),
          topic: 'Test',
        })
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/classes')
        .send({
          teacherId: 'teacher-1',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        })
        .expect(401);
    });
  });

  describe('/classes/upcoming (GET)', () => {
    it('should return upcoming classes for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/classes/upcoming')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/classes/upcoming')
        .expect(401);
    });
  });

  describe('/classes/past (GET)', () => {
    it('should return past classes for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/classes/past')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/classes/:id (GET)', () => {
    it('should return class details for participant', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: new Date(Date.now() + 172800000).toISOString(),
          endTime: new Date(Date.now() + 176400000).toISOString(),
          topic: 'Test Class',
        });

      const classId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/classes/${classId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', classId);
      expect(response.body).toHaveProperty('topic');
    });

    it('should return 403 for non-participant', async () => {
      await request(app.getHttpServer())
        .get('/classes/some-other-class-id')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('/classes/:id/confirm (POST)', () => {
    it('should allow teacher to confirm class', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: new Date(Date.now() + 259200000).toISOString(),
          endTime: new Date(Date.now() + 262800000).toISOString(),
          topic: 'To Be Confirmed',
        });

      const classId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/classes/${classId}/confirm`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('should not allow student to confirm class', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: new Date(Date.now() + 345600000).toISOString(),
          endTime: new Date(Date.now() + 349200000).toISOString(),
          topic: 'Student Cannot Confirm',
        });

      const classId = createResponse.body.id;

      await request(app.getHttpServer())
        .post(`/classes/${classId}/confirm`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('/classes/:id/notes (POST)', () => {
    it('should allow teacher to add notes', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: new Date(Date.now() + 432000000).toISOString(),
          endTime: new Date(Date.now() + 435600000).toISOString(),
          topic: 'Notes Test',
        });

      const classId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/classes/${classId}/notes`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          notes: 'Great progress today!',
          homeworkDescription: 'Practice surah Al-Fatiha',
        })
        .expect(200);

      expect(response.body.notes).toBe('Great progress today!');
      expect(response.body.homeworkDescription).toBe('Practice surah Al-Fatiha');
    });
  });

  describe('/classes/:id/cancel (POST)', () => {
    it('should allow teacher to cancel class', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: new Date(Date.now() + 518400000).toISOString(),
          endTime: new Date(Date.now() + 522000000).toISOString(),
          topic: 'To Be Cancelled',
        });

      const classId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/classes/${classId}/cancel`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.status).toBe('cancelled');
    });

    it('should allow student to cancel class', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: new Date(Date.now() + 604800000).toISOString(),
          endTime: new Date(Date.now() + 608400000).toISOString(),
          topic: 'Student Cancellation',
        });

      const classId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/classes/${classId}/cancel`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.status).toBe('cancelled');
    });
  });

  describe('/classes/:id/feedback (POST)', () => {
    it('should allow student to add feedback', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: new Date(Date.now() - 172800000).toISOString(),
          endTime: new Date(Date.now() - 169200000).toISOString(),
          topic: 'Past Class for Feedback',
        });

      const classId = createResponse.body.id;

      await request(app.getHttpServer())
        .post(`/classes/${classId}/confirm`)
        .set('Authorization', `Bearer ${teacherToken}`);

      const response = await request(app.getHttpServer())
        .post(`/classes/${classId}/feedback`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          rating: 5,
          feedback: 'Excellent class!',
        })
        .expect(200);

      expect(response.body.studentRating).toBe(5);
      expect(response.body.studentFeedback).toBe('Excellent class!');
    });

    it('should not allow teacher to add student feedback', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacherId,
          startTime: new Date(Date.now() - 259200000).toISOString(),
          endTime: new Date(Date.now() - 255600000).toISOString(),
          topic: 'Another Past Class',
        });

      const classId = createResponse.body.id;

      await request(app.getHttpServer())
        .post(`/classes/${classId}/confirm`)
        .set('Authorization', `Bearer ${teacherToken}`);

      await request(app.getHttpServer())
        .post(`/classes/${classId}/feedback`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          rating: 4,
          feedback: 'This is teacher feedback',
        })
        .expect(403);
    });
  });

  describe('/classes/availability/:teacherId (GET)', () => {
    it('should return teacher availability', async () => {
      const response = await request(app.getHttpServer())
        .get(`/classes/availability/${teacherId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
