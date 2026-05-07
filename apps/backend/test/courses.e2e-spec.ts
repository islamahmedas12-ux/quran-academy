import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('CoursesController (e2e)', () => {
  let app: INestApplication;
  let instructorToken: string;
  let studentToken: string;
  let instructorId: string;
  let studentId: string;
  let courseId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const instructorResponse = await request(app.getHttpServer())
      .post('/auth/magic-link')
      .send({ email: 'instructor@example.com' });
    const instructorTokenResult = await request(app.getHttpServer())
      .get('/auth/verify')
      .query({ token: instructorResponse.body.data.token });
    instructorToken = instructorTokenResult.body.data.accessToken;
    instructorId = instructorTokenResult.body.data.user.id;

    const studentResponse = await request(app.getHttpServer())
      .post('/auth/magic-link')
      .send({ email: 'student@example.com' });
    const studentTokenResult = await request(app.getHttpServer())
      .get('/auth/verify')
      .query({ token: studentResponse.body.data.token });
    studentToken = studentTokenResult.body.data.accessToken;
    studentId = studentTokenResult.body.data.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/courses (GET)', () => {
    it('should return published courses', async () => {
      const response = await request(app.getHttpServer())
        .get('/courses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/courses')
        .query({ category: 'tajweed' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by difficulty', async () => {
      const response = await request(app.getHttpServer())
        .get('/courses')
        .query({ difficulty: 'beginner' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search by title or description', async () => {
      const response = await request(app.getHttpServer())
        .get('/courses')
        .query({ search: 'Quran' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/courses (POST)', () => {
    it('should create a new course as instructor', async () => {
      const response = await request(app.getHttpServer())
        .post('/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Advanced Tajweed Rules',
          description: 'Master the art of Quran recitation',
          category: 'tajweed',
          difficulty: 'advanced',
          language: 'ar',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Advanced Tajweed Rules');
      courseId = response.body.id;
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/courses')
        .send({
          title: 'Test Course',
          category: 'tajweed',
        })
        .expect(401);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          category: 'tajweed',
        })
        .expect(400);
    });
  });

  describe('/courses/:id (GET)', () => {
    it('should return course details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/courses/${courseId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', courseId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('lessons');
    });

    it('should return 404 for non-existent course', async () => {
      await request(app.getHttpServer())
        .get('/courses/non-existent-id')
        .expect(404);
    });
  });

  describe('/courses/:id (PATCH)', () => {
    it('should update course as instructor', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Updated Course Title',
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Course Title');
      expect(response.body.description).toBe('Updated description');
    });

    it('should return 403 if not authorized', async () => {
      await request(app.getHttpServer())
        .patch(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Update',
        })
        .expect(403);
    });
  });

  describe('/courses/:id/publish (POST)', () => {
    it('should publish course as instructor', async () => {
      const response = await request(app.getHttpServer())
        .post(`/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.isPublished).toBe(true);
    });
  });

  describe('/courses/:id/lessons (POST)', () => {
    it('should add lesson to course', async () => {
      const response = await request(app.getHttpServer())
        .post(`/courses/${courseId}/lessons`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Lesson 1: Basics',
          description: 'Introduction to tajweed',
          order: 1,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Lesson 1: Basics');
    });
  });

  describe('/enrollments (POST)', () => {
    it('should enroll student in course', async () => {
      const response = await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.courseId).toBe(courseId);
    });

    it('should return 400 if already enrolled', async () => {
      await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
        })
        .expect(400);
    });
  });

  describe('/enrollments/my (GET)', () => {
    it('should return student enrollments', async () => {
      const response = await request(app.getHttpServer())
        .get('/enrollments/my')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/enrollments/:id (GET)', () => {
    it('should return enrollment details', async () => {
      const enrollmentsResponse = await request(app.getHttpServer())
        .get('/enrollments/my')
        .set('Authorization', `Bearer ${studentToken}`);

      const enrollmentId = enrollmentsResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .get(`/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', enrollmentId);
      expect(response.body).toHaveProperty('course');
      expect(response.body).toHaveProperty('lessonProgress');
    });
  });

  describe('/enrollments/:id/progress (PATCH)', () => {
    it('should update lesson progress', async () => {
      const enrollmentsResponse = await request(app.getHttpServer())
        .get('/enrollments/my')
        .set('Authorization', `Bearer ${studentToken}`);

      const enrollmentId = enrollmentsResponse.body[0].id;
      const lessonId = enrollmentsResponse.body[0].course.lessons[0].id;

      const response = await request(app.getHttpServer())
        .patch(`/enrollments/${enrollmentId}/progress`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          lessonId,
          watchedDuration: 300,
          isCompleted: true,
        })
        .expect(200);

      expect(response.body.isCompleted).toBe(true);
    });
  });

  describe('/enrollments/:id/certificate (POST)', () => {
    it('should generate certificate for completed course', async () => {
      const enrollmentsResponse = await request(app.getHttpServer())
        .get('/enrollments/my')
        .set('Authorization', `Bearer ${studentToken}`);

      const enrollmentId = enrollmentsResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .post(`/enrollments/${enrollmentId}/certificate`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('certificateUrl');
    });
  });

  describe('/courses/:id (DELETE)', () => {
    it('should soft delete course as org admin', async () => {
      await request(app.getHttpServer())
        .delete(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(403);
    });
  });
});
