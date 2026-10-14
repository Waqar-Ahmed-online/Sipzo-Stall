import { Schema, model, models } from "mongoose";

// One document per day (_id = "2026-09-09"), so order numbers restart
// at 1 every morning.
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default models.Counter || model("Counter", CounterSchema);
