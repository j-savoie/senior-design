const {testUser} =  require('../../testhelper/variables');
const initializeDatabase = require("../../testhelper/initializedatabase");
const cleanDatabase = require("../../testhelper/cleandatabase");
const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');

beforeAll(async () => {
    await initializeDatabase();
});

afterAll(async () => {
    await cleanDatabase();
    mongoose.disconnect();
}, 10000);

describe('POST /login', () => {

    it('should return 400 if no request body is sent', async () => {
        const res = await request(app)
            .post('/user/login')
            .expect(400)
            .send() 
        expect(res.body).toEqual({err: 'No request body', code: 400});
    });

    it('should return 400 if invalid password is sent', async () => {
        const userData = { email: testUser.email, password: 'incorrectPass' };
        const res = await request(app)
            .post('/user/login')
            .expect(400)
            .send(userData) 
        expect(res.body).toEqual({err: 'Invalid email or password', code: 400});
    });

    it('should return 400 if invalid email is sent', async () => {
        const userData = { email: 'incorrect@email.ca', password: testUser.password };
        const res = await request(app)
            .post('/user/login')
            .expect(400)
            .send(userData) 
        expect(res.body).toEqual({err: 'Invalid email or password', code: 400});
    });

    it('should return 200 and token if valid credentials are sent', async () => {
        const userData = { email: testUser.email, password: testUser.password }; 
        const res = await request(app)
            .post('/user/login')
            .expect(200)
            .send(userData) 
        expect(res.body.token).toBeDefined();  

    });  

    //! Might be difficult to execute this test. 
    // it('should return 500 if internal server error occurs', async () => { 

    //     const userData = { email: 'test@email.com', password: 'testpassword' }; 

    //     bcrypt.compare = jest.fn().mockImplementationOnce((reqBody, findUserPassword, cbFn) => 
    //         cbFn({ err : "Internal server error" })
    //     );  

    //     const res = await request(app)
    //         .post('/user/login')
    //         .expect(500)
    //         .send(userData) 
    //     expect(res.body).toEqual({err: 'Internal server error', code: 500}); 
    // });
});