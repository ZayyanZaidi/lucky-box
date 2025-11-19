import { signupUser, loginUser } from "../services/authService.js";

export const signup = async (req, res) => {
  try {
    const data = await signupUser(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
