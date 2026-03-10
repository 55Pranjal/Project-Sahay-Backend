import express from "express";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
GET ALL SURPLUS LISTINGS
GET /api/surplus
=========================================
*/

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("donor_surplus")
      .select(
        `
        *,
        users (
          id,
          full_name
        ),
        categories (
          id,
          name,
          slug
        )
      `,
      )
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
=========================================
CREATE SURPLUS LISTING
POST /api/surplus
=========================================
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const donorId = req.user.id;

    const {
      title,
      description,
      category_id,
      quantity,
      unit,
      condition,
      pickup_required,
      city,
      state,
      pincode,
      images,
      expires_at,
    } = req.body;

    const { data, error } = await supabase
      .from("donor_surplus")
      .insert([
        {
          donor_id: donorId,
          title,
          description,
          category_id,
          quantity,
          unit,
          condition,
          pickup_required,
          city,
          state,
          pincode,
          images,
          expires_at,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Surplus listing created successfully",
      surplus: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
