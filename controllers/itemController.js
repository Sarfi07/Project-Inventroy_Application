const Item = require("../models/item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const pool = require("../db/pool");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// configure multer to store files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// display single item
exports.item_detail = asyncHandler(async (req, res, next) => {
  // const item = await Item.findById(req.params.id)
  //   .populate("category subCategory")
  //   .exec();

  const item = await pool.query(
    "SELECT item.*, category.name AS category_name, subCategory.name AS sub_category_name FROM item INNER JOIN category ON item.category_id=category.id INNER JOIN subCategory ON item.subCategory_id=subCategory.id WHERE item.id=($1);",
    [req.params.id]
  );

  console.log(item.rows[0]);
  res.render("item_detail", {
    item: item.rows[0],
  });
});

// create
exports.item_create_get = asyncHandler(async (req, res, next) => {
  // const categories = await Category.find().sort({ name: 1 }).exec();
  const categories = await pool.query("SELECT * FROM category");

  res.render("item_form", {
    title: "Create Item",
    categories: categories.rows,
  });
});

exports.item_create_post = [
  upload.single("file"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const file = req.file;
    let imgUrl;
    if (file) {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        async (error, result) => {
          if (error) {
            return next(error);
          }
          imgUrl = result.secure_url;
        }
      );

      stream.end(file.buffer);
    }

    // const categories = await Category.find().sort({ name: 1 }).exec();

    const item = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.categoryId,
      subCategory: req.body.subCategoryId,
      size: req.body.size,
      quantity: req.body.quantity,
    };

    const categories = await pool.query("SELECT * FROM category");

    if (!errors.isEmpty()) {
      res.render("item_form", {
        title: "Create Item",
        item: item,
        categories: categories,
        errors: errors.array(),
        selectedCategory: req.body.categoryId,
      });
    } else {
      console.log(
        req.body.name,
        req.body.description,
        req.body.categoryId,
        req.body.subCategoryId,
        req.body.size,
        req.body.quantity
      );
      try {
        const newItem = await pool.query(
          `INSERT INTO item (name, description, category_id, subCategory_id, size, quantity, price, imgUrl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [
            req.body.name,
            req.body.description,
            req.body.categoryId,
            req.body.subCategoryId,
            req.body.size,
            req.body.quantity,
            req.body.price,
            imgUrl ? imgUrl : "",
          ]
        );
        res.redirect("/catalog/item/" + newItem.rows[0].id);
      } catch (err) {
        return next(err);
      }
    }
  }),
];

// update
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // const [categories, item] = await Promise.all([
  //   Category.find().sort({ name: 1 }).exec(),
  //   Item.findById(req.params.id).populate("category subCategory").exec(),
  // ]);

  // const subCategories = await SubCategory.find({
  //   category: item.category,
  // }).exec();

  // const selectedCategory = await Category.findById(item.category).exec();

  const [categories, item] = await Promise.all([
    pool.query("SELECT * FROM category"),
    pool.query("SELECT * FROM item WHERE id=($1)", [req.params.id]),
  ]);

  const [subCategories, selectedCategory, selectedSubCategory] =
    await Promise.all([
      pool.query("SELECT * FROM subCategory where category_id=($1)", [
        item.rows[0].category_id,
      ]),
      pool.query("SELECT * FROM category where id=($1)", [
        item.rows[0].category_id,
      ]),
      pool.query("SELECT * FROM subCategory WHERE id=($1)", [
        item.rows[0].subcategory_id,
      ]),
    ]);

  res.render("item_form", {
    title: "Update Item",
    item: item.rows[0],
    categories: categories.rows,
    selectedCategory: selectedCategory.rows[0],
    subCategories: subCategories.rows,
    selectedSubCategory: selectedSubCategory.rows[0],
  });
});

exports.item_update_post = [
  upload.single("file"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const file = req.file;
    let imgUrl;
    if (file) {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        async (error, result) => {
          if (error) {
            return next(error);
          }
          imgUrl = result.secure_url;
        }
      );

      stream.end(file.buffer);
    }

    // const categories = await Category.find().sort({ name: 1 }).exec();

    const item = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.categoryId,
      subCategory: req.body.subCategoryId,
      size: req.body.size,
      quantity: req.body.quantity,
    };

    const categories = await pool.query("SELECT * FROM category");

    if (!errors.isEmpty()) {
      res.render("item_form", {
        title: "Create Item",
        item: item,
        categories: categories,
        errors: errors.array(),
        selectedCategory: req.body.categoryId,
      });
    } else {
      console.log(
        req.body.name,
        req.body.description,
        req.body.categoryId,
        req.body.subCategoryId,
        req.body.size,
        req.body.quantity
      );
      try {
        await pool.query(
          `UPDATE item 
   SET 
     name = $1, 
     description = $2, 
     category_id = $3, 
     subCategory_id = $4, 
     size = $5, 
     quantity = $6, 
     price = $7, 
     imgUrl = $8 
   WHERE id = $9 
   RETURNING id`,
          [
            req.body.name,
            req.body.description,
            req.body.categoryId,
            req.body.subCategoryId,
            req.body.size,
            req.body.quantity,
            req.body.price,
            imgUrl ? imgUrl : "",
            req.params.id,
          ]
        );

        res.redirect("/catalog/item/" + req.params.id);
      } catch (err) {
        return next(err);
      }
    }
  }),
];

// delete
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  // const item = await Item.findById(req.params.id).exec();
  const item = await pool.query("SELECT * FROM item WHERE id=($1)", [
    req.params.id,
  ]);

  res.render("item_delete", {
    title: "Delete Item",
    item: item.rows[0],
  });
});
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  // const item = await Item.findById(req.params.id).exec();
  const item = await pool.query("SELECT * FROM item WHERE id=($1)", [
    req.params.id,
  ]);
  const subCategory_id = item.rows[0].subcategory_id;
  console.log(subCategory_id);

  if (item === null) {
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  try {
    // await Item.findByIdAndDelete(req.params.id).exec();
    await pool.query("DELETE from item where id=($1)", [req.params.id]);
    res.redirect(`/catalog/subCategory/${subCategory_id}`);
  } catch (err) {
    return next(err);
  }
});
