#! /usr/bin/env node

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require("./models/item");
const Category = require("./models/category");
const SubCategory = require("./models/subCategory");

const items = [];
const categories = [];
const subCategories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createSubCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.

// create individual books
async function itemCreate(
  index,
  name,
  description,
  category,
  subCategory,
  size,
  quantity
) {
  const item = new Item({
    name: name,
    description: description,
    category: category,
    subCategory: subCategory,
    sizesAvailable: [
      {
        size: size,
        quantity: quantity,
      },
    ],
  });
  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function categoryCreate(index, name, description) {
  const category = new Category({
    name: name,
    description: description,
  });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function subCategoryCreate(index, category, name, description) {
  const subCategory = new SubCategory({
    category: category,
    name: name,
    description: description,
  });

  await subCategory.save();
  subCategories[index] = subCategory;
  console.log(`Sub Category added: ${name}`);
}

// create category
async function createCategories() {
  console.log("Adding Categories");
  await Promise.all([
    categoryCreate(
      0,
      "Clothing",
      "Clothing for all occasions: stylish, comfortable, versatile, quality apparel."
    ),
    categoryCreate(
      1,
      "Electronics",
      "latest gadgets, high-tech devices, innovative, reliable, quality technology."
    ),
  ]);
}

// create subcategory
async function createSubCategories() {
  console.log("Adding Sub Categories");
  await Promise.all([
    subCategoryCreate(
      0,
      categories[0],
      "Formal Wear",
      "Discover our range of elegant formal wear for men, including tailored suits, stylish blazers, and crisp dress shirts, perfect for business meetings, formal events, and special occasions."
    ),
    subCategoryCreate(
      1,
      categories[1],
      "Smartphones",
      "Latest smartphones from top brands."
    ),
  ]);
}

// create item
async function createItems() {
  await itemCreate(
    0,
    "Men's Slim Fit Blazer",
    "Tailored slim fit blazer perfect for business meetings and formal events.",
    categories[0],
    subCategories[0],
    "L",
    25
  );
  await itemCreate(
    1,
    "Women's Elegant Evening Gown",
    "Sophisticated evening gown with intricate detailing, ideal for formal occasions.",
    categories[0],
    subCategories[0],
    "M",
    15
  );
  await itemCreate(
    2,
    "XPhone 12 Pro",
    "Latest smartphone with high-resolution display, powerful processor, and advanced camera.",
    categories[1],
    subCategories[1],
    "128GB",
    100
  );
  await itemCreate(
    3,
    "Galaxy S20 Ultra",
    "High-end smartphone with exceptional camera capabilities and long-lasting battery life.",
    categories[1],
    subCategories[1],
    "256GB",
    50
  );
}
