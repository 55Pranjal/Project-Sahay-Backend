import express from "express";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

//REGISTER NGO

router.post("/register", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      org_name,
      registration_number,
      description,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      website_url,
      logo_url,
      cover_image_url,
    } = req.body;

    // Prevent multiple NGOs per user
    const { data: existingNgo } = await supabase
      .from("ngos")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingNgo) {
      return res.status(400).json({
        error: "User already registered an NGO",
      });
    }

    const { data, error } = await supabase
      .from("ngos")
      .insert([
        {
          user_id: userId,
          org_name,
          registration_number,
          description,
          address,
          city,
          state,
          pincode,
          latitude,
          longitude,
          website_url,
          logo_url,
          cover_image_url,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "NGO registered successfully",
      ngo: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//GET NGO OF LOGGED IN USER

router.get("/my-ngo", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("ngos")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "NGO not found" });
  }
});

//GET NGO BY ID

router.get("/:id", async (req, res) => {
  try {
    const ngoId = req.params.id;

    const { data, error } = await supabase
      .from("ngos")
      .select("*")
      .eq("id", ngoId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "NGO not found" });
  }
});

//UPDATE NGO DETAILS

router.patch("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const updates = req.body;

    const { data, error } = await supabase
      .from("ngos")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "NGO updated successfully",
      ngo: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
