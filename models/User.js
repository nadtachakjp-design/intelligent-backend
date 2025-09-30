const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user"], // กำหนดค่าที่อนุญาต
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject({ versionKey: false });
  delete obj.password_hash;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
