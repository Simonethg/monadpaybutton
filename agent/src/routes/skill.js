// All code comments must be in English
import express from "express";
import crypto from "crypto";
const router = express.Router();

// In-memory store for demo intents
const intents = new Map();

// AI Skill Action: create_charge
router.post("/create_charge", (req, res) => {
    const { amount, currency, concept } = req.body;
    
    // Generate a unique payment intent id
    const intentId = "pi_" + crypto.randomBytes(8).toString("hex");
    
    // Create a mock agnostic pay URL for the frontend widget
    const payUrl = `https://cdn.pesobridge.app/pay?intent=${intentId}&amount=${amount}&currency=${currency}`;
    
    intents.set(intentId, {
        amount,
        currency,
        concept,
        status: "pending",
        createdAt: new Date().toISOString()
    });

    res.json({
        intentId,
        payUrl
    });
});

// AI Skill Action: check_payment
router.get("/check_payment/:id", (req, res) => {
    const { id } = req.params;
    const intent = intents.get(id);
    
    if (!intent) {
        return res.status(404).json({ error: "Payment intent not found" });
    }

    res.json({
        intentId: id,
        status: intent.status
    });
});

// AI Skill Action: get_activity
router.get("/get_activity", (req, res) => {
    // Return mock daily totals for the AI to read
    res.json({
        totalSettledUSDC: "150.00",
        totalCharges: 3,
        date: new Date().toISOString().split('T')[0]
    });
});

export default router;
