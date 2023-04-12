const { MongoMemoryServer } = require('mongodb-memory-server');
const mapData = require('../test/MapEditingInfo.json');
const vatican = require('../test/vatican.json');

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

  test('Create Map and Delete Map', async () => {
    // login user
    let response = await request(app).post('/api/login').send({
      username: 'testy',
      password: 'test123456',
    });
    const cookie = response.get('Set-Cookie');

    response = await request(app)
      .post('/api/mapeditinginfo')
      .set('Cookie', cookie)
      .send({
        mapName: mapData.mapName,
        geojson: mapData.geojson,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.map.mapName).toBe(mapData.mapName);
    expect(response.body.map.ownedUser).toBe('testy');
    expect(response.body.map.geojson.toString()).toBe(
      mapData.geojson.toString()
    );

    // Delete Map
    const mapId = response.body.map._id;
    response = await request(app)
      .delete(`/api/mapeditinginfo/${mapId}`)
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(200);

    response = await request(app)
      .get(`/api/mapeditinginfo/${mapId}`)
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(400);
  }, 60000);

  test('Update Map Name and Get map', async () => {
    // login user
    let response = await request(app).post('/api/login').send({
      username: 'testy',
      password: 'test123456',
    });
    const cookie = response.get('Set-Cookie');

    response = await request(app)
      .post('/api/mapeditinginfo')
      .set('Cookie', cookie)
      .send({
        mapName: mapData.mapName,
        geojson: mapData.geojson,
      });

    const mapId = response.body.map._id;
    const newMapName = 'Vatican';

    response = await request(app)
      .post(`/api/mapeditinginfo/${mapId}`)
      .set('Cookie', cookie)
      .send({
        mapName: newMapName,
        geojson: vatican,
      });
    expect(response.statusCode).toBe(200);

    response = await request(app)
      .get(`/api/mapeditinginfo/${mapId}`)
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.map.mapName).toBe(newMapName);
    expect(response.body.map.geojson.toString()).toBe(vatican.toString());
  }, 60000);
});
