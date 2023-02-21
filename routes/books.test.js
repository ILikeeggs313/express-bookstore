//adding integration test routes to make sure the response expected is sent
//we test the routes and the vaidation
process.env.NODE_END = 'test';

const req = require('express/lib/request');
const request = require('supertest');
const app = require('../app');
const db = require('../db');

//book sample to test
let book_isbn;

beforeEach(async function() {
    let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '123432122',
        'https://amazon.com/taco',
        'Elie',
        'English',
        100,
        'Nothing publishers',
        'my first book', 2008)
      RETURNING isbn`);
      book_isbn = result.rows[0].isbn
});

//test the first route get books by a specific title

describe ('GET /books/ :isbn', () => {
    test("get a specific book with isbn", async () => {
        const resp = await request(app)
        .get(`/books/${book_isbn}`);
        expect(resp.body.book).toHaveProperty('isbn');
        expect(resp.body.book.isbn).toBe(book_isbn);
        expect(resp.statusCode).toBe(200);
        
    });
    //if we dont have the isbn we test if it throws 404 code
    test("Can't find a book with a specific isbn", () => {
        const resp = await request(app)
        .get(`/books/500`);
        expect(resp.statusCode).toBe(404);
    })
})

//let's test the get all books route

describe('GET /books/', () => {
    test("get all books", async () => {
        const resp = await request(app)
        .get(`/books`);
        const books = resp.body.books;
        expect(books[0]).toHaveProperty('isbn');
        expect(books[0]).toHaveProperty('amazon_url');
        //test to see it returns statusCode 200
        expect(resp.statusCode).toBe(200);
    })
})

//let's test the post route
describe ('POST /books/', () =>{
    test("Post a book", async () => {
        //what can we test here? status code and isbn I guess?
         const resp = await request(app)
         .post(`/books`)
         .send({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
         });
         expect(resp.statusCode).toBe(201);
         expect(resp.body.book).toHaveProperty('isbn');
    })
})

//let's test the patch route
describe('PATCH /books/ :isbn', () =>{
    test("update a book with an isbn", async () => {
        const resp = await request(app)
        .update(`/books/${book_isbn}`)
        .send({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
        });
        expect(resp.statusCode).toBe(204);
        expect(resp.body.book.title).toBe("Updated book");
        expect(resp.body.book).toHaveProperty('isbn')

    })
})

//finally, i'll test the delete route
describe("delete a book with an isbn", () => {
    test("delete a book with an isbn", async () => {
        const resp = await request(app)
        .delete(`/books/${book_isbn}`);
        expect(resp.body).toEqual({message: `Book deleted`});
    })
})

afterEach(async () => {
    await db.query(`DELETE FROM BOOKS`);
})

//then end the db
afterAll(async () => {
    await db.end()
});

