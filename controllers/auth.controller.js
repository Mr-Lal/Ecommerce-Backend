import User from "../models/register.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema, signupSchema } from "../validator/auth.validator.js";

export const Signup = async (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);

    // If validation fails
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.errors.map((e) => e.message),
      });
    }

    // Destructure validated data
    const { username, email, password, type } = result.data;

    if (!type || !username || !email || !password) {
      return res.status(400).send("all fields are required");
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.send("User Already exist");
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashPassword,
      type,
    });

    res.status(200).json({ msg: "user created successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const Login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);

    // If validation fails
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.errors.map((e) => e.message),
      });
    }

    const { email, password } = result.data;

    if (!email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.TOKENSECURE === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      msg: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Login failed", error });
  }
};
