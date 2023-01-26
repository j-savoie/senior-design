const deleteDocuments = require("../../dbhelper/deletedocs");
const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');

const testUser = {
    fname: 'Test',
    lname: 'User',
    email: 'run_test@gmail.com',
    password: 'peanut_butter_baby',
    businessId: '63d2b33a2a75670dbd74fb3b'
}
const testUser1 = {
    fname: 'Test',
    lname: 'User',
    email: 'run_test1@gmail.com',
    password: 'peanut_butter_baby',
    businessId: null
}

beforeAll(async () => {
    const res = await request(app)
        .post('/user/register')
        .expect(201)
        .send(testUser) 
    expect(res.body).toEqual(true);

    const res1 = await request(app)
        .post('/user/register')
        .expect(201)
        .send(testUser1) 
    expect(res1.body).toEqual(true);
})

afterAll(async () => {
    const result = await deleteDocuments();
    console.log(result);
    mongoose.disconnect()
}, 10000);

describe('POST /business', () => {
    it('should return 201 and true if valid credentials are sent & user has business', async () => {
        const userData = { email: testUser.email, password: testUser.password }; 

        const login = await request(app)
            .post('/user/login')
            .expect(200)
            .send(userData) 
        expect(login.body.token).toBeDefined();  

        const business = await request(app)
            .post('/user/business')
            .set('authorization', login.body.token) 
            .expect(201)
            .send()
        expect(business._body.business).toBe(true);
        expect(business._body.code).toBe(201);
    });

    it('should return 201 and false if valid credentials are sent & user does not have a business', async () => {
        const userData = { email: testUser1.email, password: testUser1.password };  

        const login = await request(app)
            .post('/user/login')
            .expect(200)
            .send(userData) 
        expect(login.body.token).toBeDefined();  

        const business = await request(app)
            .post('/user/business')
            .set('authorization', login.body.token) 
            .expect(201)
            .send()
        expect(business._body.business).toBe(false);
        expect(business._body.code).toBe(201);
    }); 
});