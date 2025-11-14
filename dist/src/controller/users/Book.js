"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBooks = exports.getBookById = exports.getAllBooks = void 0;
const books_1 = require("../../models/schema/books");
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const getAllBooks = async (_req, res) => {
    const books = await books_1.BookModel.find().populate("categoryId");
    (0, response_1.SuccessResponse)(res, { message: "Books fetched successfully", books });
};
exports.getAllBooks = getAllBooks;
// جلب كتاب واحد
const getBookById = async (req, res) => {
    const book = await books_1.BookModel.findById(req.params.id).populate("categoryId");
    if (!book)
        throw new NotFound_1.NotFound("Book not found");
    (0, response_1.SuccessResponse)(res, { message: "Book fetched successfully", book });
};
exports.getBookById = getBookById;
const searchBooks = async (req, res) => {
    const { query = "", category } = req.query;
    // تحويل query لكلمة نص
    const searchTerm = String(query);
    const filter = {};
    // لو تم اختيار كاتيجوري
    if (category) {
        filter.categoryId = category;
    }
    // لو في كلمة بحث
    if (searchTerm.trim().length > 0) {
        filter.$or = [
            { name: { $regex: searchTerm, $options: "i" } },
            { title: { $regex: searchTerm, $options: "i" } },
            { publisher: { $regex: searchTerm, $options: "i" } },
            { language: { $regex: searchTerm, $options: "i" } },
            { writer: { $regex: searchTerm, $options: "i" } },
        ];
    }
    const books = await books_1.BookModel.find(filter).populate("categoryId");
    return (0, response_1.SuccessResponse)(res, { books });
};
exports.searchBooks = searchBooks;
