import { expect, jest } from "@jest/globals";
import { categoryControlller, createCategoryController, deleteCategoryCOntroller, singleCategoryController, updateCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel";
import slugify from "slugify";

// jest.unstable_mockModule("../models/categoryModel.js", () => ({
//     default: jest.fn(),
// }));

jest.mock("../models/categoryModel.js");

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

    test("should not save new category model when the name is not provided", async() => {
        const emptyRequest = {
            body: {},
        }

        await createCategoryController(emptyRequest, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            message: "Name is required",
        });
    });

    test("should not save new category model when there is an error", async() => {
        categoryModel.prototype.save = jest.fn().mockRejectedValue(new Error("Database Error"));

        await createCategoryController(res, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Errro in Category",
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


    test("should not save new category model when there is an error", async() => {
        categoryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error("Database Error"));

        await updateCategoryController(res, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error while updating category",
        });
    });

});



describe("Get All Categories Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should get all categories", async() => {
        categoryModel.find = jest.fn().mockResolvedValue([
            {_id: "1", name: "Clothes", slug: "clothes"},
            {_id: "2", name: "Books", slug: "books"}
        ]);

        await categoryControlller(req, res);

        expect(categoryModel.find).toHaveBeenCalledWith({});

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "All Categories List",
            category : [
                {_id: "1", name: "Clothes", slug: "clothes"},
                {_id: "2", name: "Books", slug: "books"}
            ],
        });
    });


    test("should return status 500 for errors", async() => {
        categoryModel.find = jest.fn().mockRejectedValue(new Error("Testing Error while getting all categories"));

        await categoryControlller(req, res);

        expect(categoryModel.find).toHaveBeenCalledWith({});

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.anything(),
            message: "Error while getting all categories",
        });
    });

});


describe("Get Single Category Controller Test", () => {
    let req, res;
    
    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {slug: "books"}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should return a single category when found", async () => {
        categoryModel.findOne = jest.fn().mockResolvedValue({
            _id: "1",
            name: "Books",
            slug: "books",
        });
        
        await singleCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({slug: "books"});

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Get SIngle Category SUccessfully",
            category: {
                _id: "1",
                name: "Books",
                slug: "books",
            },
        });
        
    });



    test("should return status 500 when an error occurs while getting a single category", async () => {
        categoryModel.findOne = jest.fn().mockRejectedValue(new Error("Testing Error while getting a single category"));
        
        await singleCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({slug: "books"});

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.anything(),
            message: "Error While getting Single Category",
        });
        
    });


});




describe("Delete Category Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {id: "1"}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should delete a category when found", async () => {
        categoryModel.findByIdAndDelete = jest.fn().mockResolvedValue({
            _id: "1",
            name: "Books",
            slug: "books",
        });

        await deleteCategoryCOntroller(req, res);

        expect(categoryModel.findByIdAndDelete).toHaveBeenLastCalledWith("1");

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Category Deleted Successfully",
        });
    });



    test("should return status 500 when an error occurs while deleting a single category", async () => {
        categoryModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error("Testing Error while deleting a single category"));

        await deleteCategoryCOntroller(req, res);

        expect(categoryModel.findByIdAndDelete).toHaveBeenLastCalledWith("1");

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "error while deleting category",
            error: expect.anything(),
        });
    });
});

