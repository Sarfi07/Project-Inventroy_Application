const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  // name, description, category, price, number-in-stock, url, item, size, color, brand, name

  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  description: { type: String, minLength: 6 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, min: 1 },

  sizesAvailable: {
    size: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  color: String,
  brand: String,
  subCategory: { type: Schema.Types.ObjectId, ref: "SubCategory" },
  imageUrl: { type: String },
});

ItemSchema.virtual("url").get(function () {
  return `/catalog/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);
