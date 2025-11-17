import { Router } from "express";
import { getCategories, getCategoryById,getBooksByCategory } from "../../controller/users/Category";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();
router.get("/", catchAsync(getCategories));
router.get("/:id", catchAsync(getCategoryById));
router.get("/:id/books", catchAsync(getBooksByCategory));

export default router;