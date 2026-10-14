const postgres = require("../pgModel.js");

const paste = new postgres.Schema(
  {
    _id: { type: String },
    type: { type: String },
    by: { type: String },
    status: { type: String, default: null },
    paste: { type: Array },
    paste2: { type: Array },
    expiresAt: { type: Date, expires: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = postgres.model("Paste", paste);
