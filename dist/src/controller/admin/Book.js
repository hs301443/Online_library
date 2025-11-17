"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBook = exports.createBook = exports.deleteBook = exports.getBookById = exports.getAllBooks = void 0;
const books_1 = require("../../models/schema/books");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const NotFound_1 = require("../../Errors/NotFound");
const deleteImage_1 = require("../../utils/deleteImage");
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
// إنشاء كتاب
// جلب كل الكتب
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
// تحديث كتاب
const deleteBook = async (req, res) => {
    const bookID = req.params.id;
    const book = await books_1.BookModel.findByIdAndDelete(bookID);
    if (!book)
        throw new NotFound_1.NotFound("Book not found");
    if (book.mainImage)
        (0, deleteImage_1.deletePhotoFromServer)(book.mainImage);
    if (book.gallery && Array.isArray(book.gallery)) {
        for (const img of book.gallery) {
            (0, deleteImage_1.deletePhotoFromServer)(img);
        }
    }
    (0, response_1.SuccessResponse)(res, { message: "Book deleted successfully" });
};
exports.deleteBook = deleteBook;
const uploadImageToCloudinary = async (base64, folder) => {
    const result = await cloudinary_1.default.uploader.upload(base64, { folder });
    return result.secure_url;
};
// ===================== Create Book =====================
const createBook = async (req, res) => {
    const { name, categoryId, numberOfCopies, numberInStock, publisher, writer, language, dayesofreturn, publishYear, edition, numPages, condition, weight, Synopsis, gallery, mainImage } = req.body;
    if (!name || !categoryId || numberOfCopies == null || numberInStock == null) {
        throw new BadRequest_1.BadRequest("Required fields: name, categoryId, numberOfCopies, numberInStock");
    }
    let mainImageUrl = "";
    if (mainImage) {
        mainImageUrl = await uploadImageToCloudinary(mainImage, "books");
    }
    let galleryUrls = [];
    if (gallery && Array.isArray(gallery)) {
        for (const imgBase64 of gallery) {
            const imgUrl = await uploadImageToCloudinary(imgBase64, "books/gallery");
            galleryUrls.push(imgUrl);
        }
    }
    const book = new books_1.BookModel({
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
    (0, response_1.SuccessResponse)(res, { message: "Book created successfully", book });
};
exports.createBook = createBook;
// ===================== Update Book =====================
const updateBook = async (req, res) => {
    const book = await books_1.BookModel.findById(req.params.id);
    if (!book)
        throw new NotFound_1.NotFound("Book not found");
    const { name, categoryId, numberOfCopies, numberInStock, publisher, writer, language, dayesofreturn, publishYear, edition, numPages, condition, weight, Synopsis, gallery, mainImage } = req.body;
    if (name)
        book.name = name;
    if (categoryId)
        book.categoryId = categoryId;
    if (numberOfCopies != null)
        book.numberOfCopies = numberOfCopies;
    if (numberInStock != null)
        book.numberInStock = numberInStock;
    if (publisher)
        book.publisher = publisher;
    if (writer)
        book.writer = writer;
    if (language)
        book.language = language;
    if (publishYear)
        book.publishYear = publishYear;
    if (edition)
        book.edition = edition;
    if (numPages)
        book.numPages = numPages;
    if (condition)
        book.condition = condition;
    if (weight)
        book.weight = weight;
    if (dayesofreturn)
        book.dayesofreturn = dayesofreturn;
    if (Synopsis)
        book.Synopsis = Synopsis;
    if (mainImage) {
        book.mainImage = await uploadImageToCloudinary(mainImage, "books");
    }
    if (gallery && Array.isArray(gallery)) {
        const galleryUrls = [];
        for (const imgBase64 of gallery) {
            const imgUrl = await uploadImageToCloudinary(imgBase64, "books/gallery");
            galleryUrls.push(imgUrl);
        }
        book.gallery = galleryUrls;
    }
    await book.save();
    (0, response_1.SuccessResponse)(res, { message: "Book updated successfully", book });
};
exports.updateBook = updateBook;
