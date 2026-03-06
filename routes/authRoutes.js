import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

/*
========================
SIGNUP
POST /auth/signup
========================
*/
router.post("/signup", async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    // 1️⃣ Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) throw authError;

    const userId = authData.user.id;

    // 2️⃣ Insert into users table
    const { error } = await supabase.from("users").insert([
      {
        id: userId,
        email,
        full_name,
      },
    ]);

    if (error) throw error;

    res.status(201).json({
      message: "User created successfully",
      user: authData.user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
========================
LOGIN
POST /auth/login
========================
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({
      message: "Login successful",
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
