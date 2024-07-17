import mongoose, { Schema } from "mongoose";

const subscriptionsSchema = new mongoose.Schema(
   {
      subscriber: {
         type: Schema.Types.ObjectId, // one who is subscribing
         ref: "User",
      },
      channel: {
         type: Schema.Types.ObjectId, // one who is being subscribed
         ref: "User",
      },
   },
   { timestamps: true }
);

export const Subscriptons = mongoose.model("Subscriptons", subscriptionsSchema);
