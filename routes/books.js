const express = require("express");
const Book = require("../models/book");

const router = new express.Router();
//let's deconstruct the validate method
const {validate} = require('jsonschema');
const bookSchemaNew = require('../schemas/bookSchemaNew');
const bookSchemaUpdate = require('../schemas/bookSchemaUpdate');

/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    //part 1, we validate the creation of books here
    const validation =  validate(req.body, bookSchemaNew);
    if (validation.valid){
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
    } else{
      return next({
        error: validation.errors.map(e => e.stack, 400)
      });
    }
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.patch("/:isbn", async function (req, res, next) {
  try {
    //add a validation error in case we can't update
    const validation = validate(req.body, bookSchemaUpdate);
    if(!validate.error){
      return next({
        error: validation.errors.map(e => e.stack, 400)
      });
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
    
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
