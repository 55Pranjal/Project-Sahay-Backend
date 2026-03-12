import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

/*
=========================================
UNIVERSAL SEARCH
GET /api/search
=========================================
*/

router.get("/", async (req, res) => {
  try {
    const { q, city } = req.query;

    let needsQuery = supabase
      .from("ngo_needs")
      .select(
        `
        id,
        title,
        description,
        city,
        created_at,
        ngos (
          org_name
        )
      `,
      )
      .eq("status", "open");

    let surplusQuery = supabase
      .from("donor_surplus")
      .select(
        `
        id,
        title,
        description,
        city,
        created_at,
        users (
          full_name
        )
      `,
      )
      .eq("status", "available");

    // Search keyword
    if (q) {
      needsQuery = needsQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

      surplusQuery = surplusQuery.or(
        `title.ilike.%${q}%,description.ilike.%${q}%`,
      );
    }

    // City filter
    if (city) {
      needsQuery = needsQuery.ilike("city", `%${city}%`);
      surplusQuery = surplusQuery.ilike("city", `%${city}%`);
    }

    const { data: needs } = await needsQuery;
    const { data: surplus } = await surplusQuery;

    res.json({
      needs,
      surplus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
