import { Schema, model, models } from "mongoose";

const VariantSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Pop Corn - Small"
    size: { type: String, required: true }, // e.g. "Small" / "Medium" / "Large"
    price: { type: Number, required: true },
    family: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const ProductSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  variants: [VariantSchema],
});

ProductSchema.index({ category: 1 });

export default models.Product || model("Product", ProductSchema);
