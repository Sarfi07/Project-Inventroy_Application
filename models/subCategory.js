const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: { type: Schema.Types.ObjectId },
});

SubCategorySchema.virtual("url").get(function () {
  return `/catalog/sub_category/${this._id}`;
});

module.exports = mongoose.model("SubCategory", SubCategorySchema);
