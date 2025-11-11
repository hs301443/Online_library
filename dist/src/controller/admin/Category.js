"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryById = exports.deleteCategory = exports.updateCategory = exports.getCategories = exports.createCategory = void 0;
const category_1 = require("../../models/schema/category");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const NotFound_1 = require("../../Errors/NotFound");
const handleImages_1 = require("../../utils/handleImages");
const createCategory = async (req, res) => {
    const { name, icon, parentId } = req.body;
    let iconPath;
    if (icon) {
        try {
            iconPath = await (0, handleImages_1.saveBase64Image)(icon, "categories", req, "uploads");
        }
        catch {
            throw new BadRequest_1.BadRequest("Invalid Base64 image format");
        }
    }
    const category = new category_1.Category({ name, icon: iconPath });
    await category.save();
    (0, response_1.SuccessResponse)(res, { message: "Category created successfully." }, 200);
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    const categories = await category_1.Category.find();
    (0, response_1.SuccessResponse)(res, { categories }, 200);
};
exports.getCategories = getCategories;
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, parentId, icon } = req.body;
    const category = await category_1.Category.findById(id);
    if (!category) {
        throw new NotFound_1.NotFound("Category not found");
    }
    if (name)
        category.name = name;
    if (parentId)
        category.parentId = parentId;
    if (icon) {
        try {
            category.icon = await (0, handleImages_1.saveBase64Image)(icon, "categories", req, "uploads");
        }
        catch {
            throw new BadRequest_1.BadRequest("Invalid Base64 image format");
        }
    }
    await category.save();
    (0, response_1.SuccessResponse)(res, { message: "Category updated successfully." }, 200);
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new BadRequest_1.BadRequest("Category ID is required");
    }
    const category = await category_1.Category.findByIdAndDelete(id);
    if (!category) {
        throw new NotFound_1.NotFound("Category not found");
    }
    ;
    (0, response_1.SuccessResponse)(res, { message: "Category deleted successfully." }, 200);
};
exports.deleteCategory = deleteCategory;
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    const category = await category_1.Category.findById(id);
    if (!category) {
        throw new NotFound_1.NotFound("Category not found");
    }
    (0, response_1.SuccessResponse)(res, { category }, 200);
};
exports.getCategoryById = getCategoryById;
