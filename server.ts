import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Insights
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY environment variable is required. Please configure it in your Secrets." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { data } = req.body;
      const prompt = `
You are the lead Business Intelligence AI and market strategist for Pak-Tajarat, a premium enterprise B2B/B2C marketplace in Pakistan.
Analyze the following real-time marketplace metrics and generate detailed business intelligence forecasting and strategic suggestions.

MARKETPLACE DATA SUMMARY:
- Total Products: ${data.totalProducts}
- Total Orders: ${data.totalOrders}
- Total Sales Revenue: Rs. ${data.totalRevenue}
- Average Order Value (AOV): Rs. ${data.aov}
- Cancelled Orders: ${data.cancelledOrders}
- Low Stock Products Count: ${data.lowStockCount}
- Registered Affiliate Count: ${data.affiliateCount}
- Top Affiliate Earnings: Rs. ${data.topAffiliateEarnings}
- Total Coupon Discounts Used: Rs. ${data.couponDiscount}
- Popular Category Distribution: ${JSON.stringify(data.categories)}

Provide your response in JSON format conforming to this typescript interface:
interface AIInsightsResponse {
  revenueForecast: {
    nextMonthEstimate: number;
    trendType: 'upward' | 'stable' | 'downward';
    confidenceScore: number; // percentage (0-100)
    narrative: string; // concise explanation of the forecast
  };
  topOpportunities: string[]; // 3-4 concrete product/category opportunities in Pakistan market
  inventoryReplenishment: {
    warnings: string[]; // items or actions needed for low stock
    suggestion: string;
  };
  marketingStrategy: string[]; // 3 actionable suggestions to improve conversions or affiliate engagement
}

Respond ONLY with the JSON matching the schema, without markdown formatting blocks.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No text returned from Gemini API");
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI insights" });
    }
  });

  // API Route for AI Customer Support Chatbot
  app.post("/api/customer-support-chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY environment variable is required." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { message, history, catalogContext } = req.body;

      const systemInstruction = `
You are 'Taj' (تاج), the friendly AI Customer Support Representative & Shopping Guide for 'Pak-Tajarat' (پاکستان تجارت) - Pakistan's top online marketplace.

STORE DETAILS & POLICIES:
- Name: Pak-Tajarat (پاکستان تجارت)
- Delivery: Fast delivery across all cities in Pakistan (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Multan, Quetta, Faisalabad, Sialkot, Gujranwala etc.) via TCS / Leopard Courier within 2 to 4 working days.
- Payment Methods: Cash on Delivery (COD), JazzCash, EasyPaisa, Bank Transfer, Debit/Credit Card.
- Shipping Fee: Standard Rs. 199 flat across Pakistan. FREE Shipping on orders above Rs. 2,999!
- Returns & Refunds: 7-Days Easy Return & Money-back Guarantee if product is defective, damaged, or wrong item delivered.
- Customer Helpline: Available 24/7 via WhatsApp & Email (support@paktajarat.pk).

PRODUCT CATALOG SAMPLE (Real-time live inventory):
${JSON.stringify(catalogContext || [])}

RESPONSE GUIDELINES:
1. Speak naturally and warmly in the customer's language (Roman Urdu, Urdu script, or English depending on how they type).
2. For product inquiries, suggest actual items from the catalog above with precise prices in Rs.
3. Be clear, polite, and helpful. Use friendly formatting (bullet points, emojis where useful).
4. Keep responses reasonably concise so they fit well in a chat window.
`;

      const contents = [
        ...(history || []).map((h: { role: string; text: string }) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const text = response.text || "Main Pak-Tajarat AI Assistant hoon. Maaf kijiye, main aap ki request samajh nahi paya. Dobara koshish kijiye!";
      res.json({ reply: text });
    } catch (error: any) {
      console.error("Gemini Chatbot API error:", error);
      res.status(500).json({ error: error.message || "Failed to process AI chat message" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
