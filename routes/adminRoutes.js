import express from "express";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const adminOnly = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/*
=========================================
GET NGO VERIFICATION QUEUE
GET /api/admin/verify-queue
=========================================
*/

router.get("/verify-queue", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ngos")
      .select(
        `
          *,
          users (
            id,
            email,
            full_name
          )
        `,
      )
      .eq("verification_status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
=========================================
VERIFY OR REJECT NGO
PUT /api/admin/ngos/:id/verify
=========================================
*/

router.put("/ngos/:id/verify", authMiddleware, adminOnly, async (req, res) => {
  try {
    const ngoId = req.params.id;
    const adminId = req.user.id;

    const { action, reason } = req.body;

    let updateData = {};

    if (action === "verify") {
      updateData = {
        verification_status: "verified",
        verified_at: new Date(),
        verified_by: adminId,
      };
    }

    if (action === "reject") {
      updateData = {
        verification_status: "rejected",
        rejection_reason: reason,
      };
    }

    const { data, error } = await supabase
      .from("ngos")
      .update(updateData)
      .eq("id", ngoId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: `NGO ${action}d successfully`,
      ngo: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
