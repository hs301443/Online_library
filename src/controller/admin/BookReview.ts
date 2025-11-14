import { Request, Response } from "express";
import { BookReview } from "../../models/schema/BookReview";
import { BookModel } from "../../models/schema/books";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";


export const getBookReviews = async (req: Request, res: Response) => {
  const { bookId } = req.params;

  // التأكد من وجود الكتاب
  const book = await BookModel.findById(bookId);
  if (!book) throw new NotFound("Book not found");

  // جلب كل التقييمات الخاصة بالكتاب
  const reviews = await BookReview.find({ bookId }).populate("userId", "name photo");

  SuccessResponse(res, { message: "Book reviews fetched", book, reviews });
};


// حذف تقييم أي مستخدم
export const deleteReviewByAdmin = async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  const review = await BookReview.findByIdAndDelete(reviewId);
  if (!review) throw new NotFound("Review not found");

  SuccessResponse(res, { message: "Review deleted by admin" });
};


