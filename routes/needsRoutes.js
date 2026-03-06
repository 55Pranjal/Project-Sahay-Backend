import express from "express";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
GET ALL OPEN NEEDS
GET /api/needs
=========================================
*/
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ngo_needs")
      .select(
        `
        *,
        ngos (
          id,
          org_name,
          city,
          state
        ),
        categories (
          id,
          name,
          slug
        )
      `,
      )
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
=========================================
CREATE NEED
POST /api/needs
=========================================
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get NGO of this user
    const { data: ngo } = await supabase
      .from("ngos")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!ngo) {
      return res.status(403).json({
        error: "User is not registered as an NGO",
      });
    }

    const {
      title,
      description,
      category_id,
      quantity_required,
      unit,
      urgency_level,
      deadline,
      images,
      is_monetary,
      upi_id,
    } = req.body;

    const { data, error } = await supabase
      .from("ngo_needs")
      .insert([
        {
          ngo_id: ngo.id,
          title,
          description,
          category_id,
          quantity_required,
          unit,
          urgency_level,
          deadline,
          images,
          is_monetary,
          upi_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Need created successfully",
      need: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
=========================================
UPDATE NEED
PUT /api/needs/:id
=========================================
*/
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const needId = req.params.id;
    const userId = req.user.id;

    // Check NGO ownership
    const { data: ngo } = await supabase
      .from("ngos")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!ngo) {
      return res.status(403).json({ error: "Not an NGO user" });
    }

    const { data: need } = await supabase
      .from("ngo_needs")
      .select("ngo_id")
      .eq("id", needId)
      .single();

    if (!need || need.ngo_id !== ngo.id) {
      return res.status(403).json({
        error: "Unauthorized to update this need",
      });
    }

    const updates = req.body;

    const { data, error } = await supabase
      .from("ngo_needs")
      .update(updates)
      .eq("id", needId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Need updated successfully",
      need: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
=========================================
CLOSE NEED
DELETE /api/needs/:id
=========================================
*/
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const needId = req.params.id;
    const userId = req.user.id;

    const { data: ngo } = await supabase
      .from("ngos")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!ngo) {
      return res.status(403).json({ error: "Not an NGO user" });
    }

    const { data: need } = await supabase
      .from("ngo_needs")
      .select("ngo_id")
      .eq("id", needId)
      .single();

    if (!need || need.ngo_id !== ngo.id) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    const { error } = await supabase
      .from("ngo_needs")
      .update({ status: "closed" })
      .eq("id", needId);

    if (error) throw error;

    res.json({
      message: "Need closed successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
