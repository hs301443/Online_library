import { Router } from "express";
import  {getBookReviews,deleteReviewByAdmin} from "../../controller/admin/BookReview"
import { catchAsync } from "../../utils/catchAsync";

const router = Router();
router.get("/:bookId", catchAsync(getBookReviews));
router.delete("/:id", catchAsync(deleteReviewByAdmin));
export default router;