import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import supabase from "./config/supabase.js";
import authRoutes from "./routes/authRoutes.js";
import ngoRoutes from "./routes/ngoRoutes.js";
import needsRoutes from "./routes/needsRoutes.js";
import surplusRoutes from "./routes/surplusRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sahay API running 🚀");
});

app.use("/auth", authRoutes);
app.use("/ngo", ngoRoutes);
app.use("/api/needs", needsRoutes);
app.use("/api/surplus", surplusRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);

/*
TEST SUPABASE CONNECTION
*/
app.get("/test-db", async (req, res) => {
  try {
    const { data, error } = await supabase.from("resources").select("*");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
