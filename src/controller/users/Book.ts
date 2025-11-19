import { Request, Response } from "express";
import { BookModel } from "../../models/schema/books";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";
export const getAllBooks = async (_req: Request, res: Response) => {
    const books = await BookModel.find().populate("categoryId");
      SuccessResponse(res,{message:"Books fetched successfully", books});
 
};

// جلب كتاب واحد
export const getBookById = async (req: Request, res: Response) => {
    const book = await BookModel.findById(req.params.id).populate("categoryId");
    if (!book) throw new NotFound("Book not found");

   SuccessResponse(res,{message:"Book fetched successfully", book});
};


export const searchBooks = async (req: Request, res: Response) => {
  const { query = "", category } = req.query;

  const searchTerm = String(query);

  const match: any = {};

  if (category) match.categoryId = category;

  if (searchTerm.trim()) {
    match.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { title: { $regex: searchTerm, $options: "i" } },
      { publisher: { $regex: searchTerm, $options: "i" } },
      { language: { $regex: searchTerm, $options: "i" } },
      { writer: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const books = await BookModel.aggregate([
    { $match: match },

    // ربط الريفيوهات بالكتب
    {
      $lookup: {
        from: "bookreviews",     // اسم collection في Mongo (تأكد منه)
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

  return SuccessResponse(res, { books });
};
