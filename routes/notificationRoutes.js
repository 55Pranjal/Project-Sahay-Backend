import express from "express";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
GET MY NOTIFICATIONS
GET /api/notifications
=========================================
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
