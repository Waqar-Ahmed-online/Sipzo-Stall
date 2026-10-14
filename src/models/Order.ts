import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productName: String,
    variantName: String,
    size: String,
    price: Number,
    qty: Number,
  },
  { _id: false }
);

const DeliveryDetailsSchema = new Schema(
  {
    name: String,
    phone: String,
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: Number }, // resets to 1 each day, via Counter
    orderType: {
      type: String,
      enum: ["dine-in", "takeaway", "home-delivery"],
      required: true,
    },
    table: { type: Number, default: null },
    paymentType: { type: String, enum: ["cash", "card", "online"], default: "cash" },
    deliveryDetails: { type: DeliveryDetailsSchema, default: undefined },
    deliveryCharges: { type: Number, default: 0 },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

// GET /api/orders sorts by createdAt, and every sales report aggregates
// on createdAt — without this index Mongo has to scan + sort in memory.
OrderSchema.index({ createdAt: -1 });

export default models.Order || model("Order", OrderSchema);
