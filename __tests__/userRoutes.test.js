const { MongoMemoryServer } = require('mongodb-memory-server');
const mockConnectDB = async () => {
  mongod = await MongoMemoryServer.create();
  dbUrl = mongod.getUri();
  mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   useFindAndModify: false,
  });
};

const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');
const User = require('../models/user-model');

jest.mock('../db', () => jest.fn(() => mockConnectDB()));

var mongod;

describe('All tests', () => {
  afterAll(async () => {
    try {
      await mongoose.connection.close();
      if (mongod) {
        await mongod.stop();
      }
      server.close();
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  });
  test('User Register', async () => {
    // test register route
    let response = await request(app).post('/api/register').send({
      firstName: 'Test',
      lastName: 'Y',
      email: 'test@test.com',
      password: 'test1234',
      passwordVerify: 'test1234',
      username: 'testy',
      securityQuestion1: 'What is your favorite color',
      answer1: 'blue',
      securityQuestion2: 'What is your favorite number',
      answer2: '8',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    // test login route
    response = await request(app).post('/api/login').send({
      username: 'testy',
      password: 'test1234',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    //
  }, 60000);

  test('Test Forgot Password', async () => {
    // test security question
    let response = await request(app).get('/api/sq/testy');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.securityQuestion1).toBe('What is your favorite color');
    expect(response.body.securityQuestion2).toBe(
      'What is your favorite number'
    );

    response = await request(app).post('/api/forgotPassword').send({
      username: 'testy',
      newPassword: 'test12345',
      newPasswordConfirm: 'test12345',
      answer1: 'blue',
      answer2: '8',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');

    response = await request(app).post('/api/login').send({
      username: 'testy',
      password: 'test12345',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    response = await request(app).post('/api/login').send({
      username: 'testy',
      password: 'test1234',
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.errorMessage).toBe('Invalid Credentials');
  }, 60000);

  test('Test Change Password', async () => {
    // test security question

    let response = await request(app).post('/api/login').send({
      username: 'testy',
      password: 'test12345',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    const cookie = response.get('Set-Cookie');

    response = await request(app)
      .post('/api/changePassword')
      .set('Cookie', cookie)
      .send({
        oldPassword: 'test12345',
        newPassword: 'test123456',
        newPasswordConfirm: 'test123456',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  }, 60000);
});
