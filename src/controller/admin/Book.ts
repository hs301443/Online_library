import { Request, Response } from "express";
import { BookModel } from "../../models/schema/books";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";
import cloudinary from "../../utils/cloudinary";

// إنشاء كتاب


// جلب كل الكتب
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

// تحديث كتاب

export const deleteBook = async (req: Request, res: Response) => {
   const bookID = req.params.id;
    const book = await BookModel.findByIdAndDelete(bookID);
    
    if (!book) throw new NotFound("Book not found");

     SuccessResponse(res, {message:"Book deleted successfully"} );
  
};




// دالة مساعدة لرفع صورة Base64 على Cloudinary
const uploadImageToCloudinary = async (base64: string, folder: string) => {
  const result = await cloudinary.uploader.upload(base64, { folder });
  return result.secure_url;
};

// ===================== Create Book =====================
export const createBook = async (req: Request, res: Response) => {
  const {
    name,
    categoryId,
    numberOfCopies,
    numberInStock,
    publisher,
    writer,
    language,
    dayesofreturn,
    publishYear,
    edition,
    numPages,
    condition,
    weight,
    Synopsis,
    gallery,
    mainImage
  } = req.body;

  if (!name || !categoryId || numberOfCopies == null || numberInStock == null) {
    throw new BadRequest("Required fields: name, categoryId, numberOfCopies, numberInStock");
  }

  let mainImageUrl = "";
  if (mainImage) {
    mainImageUrl = await uploadImageToCloudinary(mainImage, "books");
  }

  let galleryUrls: string[] = [];
  if (gallery && Array.isArray(gallery)) {
    for (const imgBase64 of gallery) {
      const imgUrl = await uploadImageToCloudinary(imgBase64, "books/gallery");
      galleryUrls.push(imgUrl);
    }
  }

  const book = new BookModel({
    name,
    categoryId,
    numberOfCopies,
    numberInStock,
    publisher,
    writer,
    language,
    publishYear,
    edition,
    numPages,
    condition,
    weight,
    Synopsis,
    dayesofreturn,
    mainImage: mainImageUrl,
    gallery: galleryUrls,
  });

  await book.save();
  SuccessResponse(res, { message: "Book created successfully", book });
};

// ===================== Update Book =====================
export const updateBook = async (req: Request, res: Response) => {
  const book = await BookModel.findById(req.params.id);
  if (!book) throw new NotFound("Book not found");

  const {
    name,
    categoryId,
    numberOfCopies,
    numberInStock,
    publisher,
    writer,
    language,
    dayesofreturn,
    publishYear,
    edition,
    numPages,
    condition,
    weight,
    Synopsis,
    gallery,
    mainImage
  } = req.body;

  if (name) book.name = name;
  if (categoryId) book.categoryId = categoryId;
  if (numberOfCopies != null) book.numberOfCopies = numberOfCopies;
  if (numberInStock != null) book.numberInStock = numberInStock;
  if (publisher) book.publisher = publisher;
  if (writer) book.writer = writer;
  if (language) book.language = language;
  if (publishYear) book.publishYear = publishYear;
  if (edition) book.edition = edition;
  if (numPages) book.numPages = numPages;
  if (condition) book.condition = condition;
  if (weight) book.weight = weight;
  if (dayesofreturn) book.dayesofreturn = dayesofreturn;
  if (Synopsis) book.Synopsis = Synopsis;

  if (mainImage) {
    book.mainImage = await uploadImageToCloudinary(mainImage, "books");
  }

  if (gallery && Array.isArray(gallery)) {
    const galleryUrls: string[] = [];
    for (const imgBase64 of gallery) {
      const imgUrl = await uploadImageToCloudinary(imgBase64, "books/gallery");
      galleryUrls.push(imgUrl);
    }
    book.gallery = galleryUrls;
  }

  await book.save();
  SuccessResponse(res, { message: "Book updated successfully", book });
};
