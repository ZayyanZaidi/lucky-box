import mongoose from "mongoose";

const verificationTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const VerificationToken = mongoose.model("VerificationToken", verificationTokenSchema, "email_verification_tokens");

export default VerificationToken;
