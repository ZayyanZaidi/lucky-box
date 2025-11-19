import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.js";

dotenv.config();

const [,, email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error("Usage: node resetPassword.js <email> <newPassword>");
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in environment (.env)");
  process.exit(1);
}


async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const hash = await bcrypt.hash(newPassword, 10);

    let user = await User.findOne({ email });
    if (user) {
      if (!user.username) user.username = user.name || email.split("@")[0];
      user.password = hash;
      await user.save();
      console.log(`Updated password for ${email}`);
    } else {
      const username = email.split("@")[0];
      user = await User.create({ username, email, password: hash });
      console.log(`Created new user ${email}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
