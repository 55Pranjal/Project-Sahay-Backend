import express from "express";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
SEND CONTACT REQUEST
POST /api/contacts
=========================================
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const initiatorId = req.user.id;

    const { recipient_id, listing_type, listing_id, message } = req.body;

    const { data, error } = await supabase
      .from("contacts")
      .insert([
        {
          initiator_id: initiatorId,
          recipient_id,
          listing_type,
          listing_id,
          message,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Contact request sent successfully",
      contact: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
=========================================
GET MY CONTACT HISTORY
GET /api/contacts/me
=========================================
*/

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("contacts")
      .select(
        `
        *,
        initiator:initiator_id (
          id,
          full_name
        ),
        recipient:recipient_id (
          id,
          full_name
        )
      `,
      )
      .or(`initiator_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("contacted_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
