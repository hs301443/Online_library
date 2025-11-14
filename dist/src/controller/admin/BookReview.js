"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewByAdmin = exports.getBookReviews = void 0;
const BookReview_1 = require("../../models/schema/BookReview");
const books_1 = require("../../models/schema/books");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const getBookReviews = async (req, res) => {
    const { bookId } = req.params;
    // التأكد من وجود الكتاب
    const book = await books_1.BookModel.findById(bookId);
    if (!book)
        throw new Errors_1.NotFound("Book not found");
    // جلب كل التقييمات الخاصة بالكتاب
    const reviews = await BookReview_1.BookReview.find({ bookId }).populate("userId", "name photo");
    (0, response_1.SuccessResponse)(res, { message: "Book reviews fetched", book, reviews });
};
exports.getBookReviews = getBookReviews;
// حذف تقييم أي مستخدم
const deleteReviewByAdmin = async (req, res) => {
    const { reviewId } = req.params;
    const review = await BookReview_1.BookReview.findByIdAndDelete(reviewId);
    if (!review)
        throw new Errors_1.NotFound("Review not found");
    (0, response_1.SuccessResponse)(res, { message: "Review deleted by admin" });
};
exports.deleteReviewByAdmin = deleteReviewByAdmin;
