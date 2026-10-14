import { Schema, model, models } from "mongoose";

const ExpenseSchema = new Schema(
  {
    periodType: { type: String, enum: ["daily", "monthly", "yearly"], required: true },
    periodKey: { type: String, required: true },
    expense: { type: Number, default: 0 },
    rent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ExpenseSchema.index({ periodType: 1, periodKey: 1 }, { unique: true });

export default models.Expense || model("Expense", ExpenseSchema);