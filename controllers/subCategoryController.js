const SubCategory = require("../models/subCategory");
const asyncHandler = require("express-async-handler");
const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const pool = require("../db/pool");

// all subCategory
exports.subCategory_list = asyncHandler(async (req, res, next) => {
  // helper function
  const subCategories = await pool.query(
    `SELECT * FROM subCategory where category_id=${req.params.id}`
  );
  res.json({ subCategories: subCategories.rows });
});

// display one subCategory
exports.subCategory_detail = asyncHandler(async (req, res, next) => {
  const [subCategory, items] = await Promise.all([
    pool.query(`SELECT * FROM subCategory where id=${req.params.id}`),
    pool.query(`SELECT * FROM item where subCategory_id=${req.params.id}`),
  ]);

  const category = await pool.query(
    `SELECT * FROM category where id=${subCategory.rows[0].category_id}`
  );
  res.render("subCategory_detail", {
    title: "Sub Category Detail",
    subCategory: subCategory.rows[0],
    items: items.rows,
    category: category.rows[0],
  });
});

// create subCategory
exports.subCategory_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await pool.query(
    "SELECT * FROM category order by name"
  );
  res.render("subCategory_form", {
    title: "Create Sub Category",
    categories: allCategories.rows,
  });
});

exports.subCategory_create_post = [
  body("name", "Sub Category name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("subCategory_form", {
        title: "Create Sub Category",
        subCategory: subCategory,
        errors: errors.array(),
      });
    } else {
      try {
        const subCategory = await pool.query(
          "INSERT INTO subCategory (name, description, category_id) VALUES ($1, $2, $3) RETURNING id",
          [req.body.name, req.body.description, req.body.categoryId]
        );
        res.redirect("/catalog/subCategory/" + subCategory.rows[0].id);
      } catch (err) {
        return next(err);
      }
    }
  }),
];

// update subCategory
exports.subCategory_update_get = asyncHandler(async (req, res, next) => {
  const [subCategory, allCategories] = await Promise.all([
    pool.query("SELECT * FROM subCategory WHERE id=($1)", [req.params.id]),
    pool.query("SELECT * FROM category"),
  ]);

  const selectedCategory = await pool.query(
    "SELECT * FROM category WHERE id=($1)",
    [subCategory.rows[0].category_id]
  );
  res.render("subCategory_form", {
    title: "Update Sub Category",
    categories: allCategories.rows,
    selectedCategory: selectedCategory.rows[0].name,
    subCategory: subCategory.rows[0],
  });
});

exports.subCategory_update_post = [
  body("name", "Sub Category name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const subCategory = await pool.query(
      "SELECT * FROM subCategory WHERE id=($1)",
      [req.params.id]
    );

    if (!errors.isEmpty()) {
      res.render("subCategory_form", {
        title: "Create Sub Category",
        subCategory: subCategory,
        errors: errors.array(),
      });
    } else {
      try {
        // await SubCategory.findByIdAndUpdate(req.params.id, subCategory);
        const updatedSubCategory = await pool.query(
          "UPDATE subCategory SET name=($1), description=($2), category_id=($3) WHERE id=($4) RETURNING id",
          [
            req.body.name,
            req.body.description,
            req.body.categoryId,
            req.params.id,
          ]
        );
        res.redirect("/catalog/subCategory/" + subCategory.rows[0].id);
      } catch (err) {
        return next(err);
      }
    }
  }),
];

// delete subCategory
exports.subCategory_delete_get = asyncHandler(async (req, res, next) => {
  const [allItems, subCategory] = await Promise.all([
    pool.query("SELECT * FROM item WHERE subCategory_id=($1)", [req.params.id]),
    pool.query("SELECT * FROM subCategory WHERE id=($1)", [req.params.id]),
  ]);

  res.render("subCategory_delete", {
    title: "Delete Sub Category",
    items: allItems.rows,
    subCategory: subCategory.rows[0],
  });
});

exports.subCategory_delete_post = asyncHandler(async (req, res, next) => {
  const subCategory = await pool.query(
    "SELECT * FROM subCategory WHERE id=($1)",
    [req.params.id]
  );

  // being redundant because want to show confirmation message
  const [category, subCategories] = await Promise.all([
    pool.query(
      `SELECT * from category where id=${subCategory.rows[0].category_id}`
    ),
    pool.query(
      `SELECT * from subCategory where category_id=${subCategory.rows[0].category_id}`
    ),
  ]);

  if (subCategory.rows[0] === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  try {
    await pool.query("DELETE FROM subCategory where id=($1)", [req.params.id]);
    res.render("category_detail", {
      title: "Category Detail",
      category: category.rows[0],
      subCategories: subCategories.rows,
      confirmationMessage: `${subCategory.rows[0].name} named sub category has been deleted.`,
    });
  } catch (err) {
    return next(err);
  }
});
