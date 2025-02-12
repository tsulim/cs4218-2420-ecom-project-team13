import { expect, jest } from "@jest/globals";
import { createCategoryController, updateCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel";
import slugify from "slugify";

jest.unstable_mockModule("../models/categoryModel.js", () => ({
    default: jest.fn(),
}));

describe("Create Category Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {
                name: "Car"
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should save new category model when it does not already exist", async() => {
        // Mock 'findOne' to return null for indicating category does not exist
        categoryModel.findOne = jest.fn().mockResolvedValue(null);

        // Mock 'save' method for saving a new category
        categoryModel.prototype.save = jest.fn().mockResolvedValue({
            name: "Car",
            slug: "car"
        });

        // Call the controller
        await createCategoryController(req, res);

        // Expect 'findOne' to be called to check if the category exists
        expect(categoryModel.findOne).toHaveBeenCalledWith({name: "Car"});

        // Expect 'save' to be called to save new category 
        expect(categoryModel.prototype.save).toHaveBeenCalled();

        // Expect response to return status 201 for created
        expect(res.status).toHaveBeenCalledWith(201);

        // Expect success message in response
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "new category created",
            category: {
                name: "Car",
                slug: "car"
            }
        });

    });


    test("should not save new category model when it already exist", async() => {
        categoryModel.findOne = jest.fn().mockResolvedValue({ name: "Car", slug: "car"});
        categoryModel.prototype.save = jest.fn();

        await createCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({name: "Car"});
        expect(categoryModel.prototype.save).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Category Already Exists",
        });
    });
});



describe("Update Category Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {id: "123"},
            body: {name: "Category Updated"},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should update category if exists", async () => {
        categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
            _id: "123",
            name: "Category Updated",
            slug: slugify("Category Updated"),
        });

        await updateCategoryController(req, res);

        expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
            "123",
            {name: "Category Updated", slug: slugify("Category Updated")},
            {new: true}
        );
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Category Updated Successfully",
            category: {
                _id: "123",
                name: "Category Updated",
                slug: slugify("Category Updated"),
            },
        });
    });

    test("should return error message when category is not found", async() => {
        categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        await updateCategoryController(req, res);;

        expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
            "123",
            {name: "Category Updated", slug: slugify("Category Updated")},
            {new: true}
        );

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Category not found",
            error: "Category not found while updating",
        });
    });

});