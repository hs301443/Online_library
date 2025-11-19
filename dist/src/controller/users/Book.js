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
    const searchTerm = String(query);
    const match = {};
    if (category)
        match.categoryId = category;
    if (searchTerm.trim()) {
        match.$or = [
            { name: { $regex: searchTerm, $options: "i" } },
            { title: { $regex: searchTerm, $options: "i" } },
            { publisher: { $regex: searchTerm, $options: "i" } },
            { language: { $regex: searchTerm, $options: "i" } },
            { writer: { $regex: searchTerm, $options: "i" } },
        ];
    }
    const books = await books_1.BookModel.aggregate([
        { $match: match },
        // ربط الريفيوهات بالكتب
        {
            $lookup: {
                from: "bookreviews", // اسم collection في Mongo (تأكد منه)
                localField: "_id",
                foreignField: "bookId",
                as: "reviews",
            },
        },
        // حساب متوسط التقييم
        {
            $addFields: {
                averageRating: { $avg: "$reviews.rating" },
            },
        },
        // لو عايز تخفي reviews
        {
            $project: {
                reviews: 0,
            },
        },
    ]);
    return (0, response_1.SuccessResponse)(res, { books });
};
exports.searchBooks = searchBooks;
