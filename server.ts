import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createHash, createHmac } from "node:crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Minimal, read-only Cloudflare R2 connectivity check.
  // Never returns credentials or bucket contents.
  app.get("/api/r2/health", async (_req, res) => {
    const required = [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
      "R2_ENDPOINT",
    ];
    const missing = required.filter((key) => !process.env[key]?.trim());
    if (missing.length) {
      return res.status(503).json({
        ok: false,
        message: "R2 environment variables are missing.",
        missing,
      });
    }

    try {
      const accountId = process.env.R2_ACCOUNT_ID!.trim();
      const accessKey = process.env.R2_ACCESS_KEY_ID!.trim();
      const secretKey = process.env.R2_SECRET_ACCESS_KEY!.trim();
      const bucket = process.env.R2_BUCKET_NAME!.trim();
      const endpoint = process.env.R2_ENDPOINT!.trim().replace(/\/+$/, "");
      const endpointUrl = new URL(endpoint);

      if (
        !/^[a-f0-9]{32}$/i.test(accountId) ||
        !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket) ||
        endpointUrl.protocol !== "https:" ||
        endpointUrl.hostname !== `${accountId}.r2.cloudflarestorage.com`
      ) {
        return res.status(503).json({
          ok: false,
          message: "R2 configuration format is invalid. Check Account ID, bucket name, and endpoint.",
        });
      }

      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
      const dateStamp = amzDate.slice(0, 8);
      const payloadHash = createHash("sha256").update("").digest("hex");
      const canonicalUri = `/${encodeURIComponent(bucket)}`;
      const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
      const canonicalHeaders =
        `host:${endpointUrl.host}\n` +
        `x-amz-content-sha256:${payloadHash}\n` +
        `x-amz-date:${amzDate}\n`;
      const canonicalRequest = [
        "HEAD",
        canonicalUri,
        "",
        canonicalHeaders,
        signedHeaders,
        payloadHash,
      ].join("\n");
      const scope = `${dateStamp}/auto/s3/aws4_request`;
      const stringToSign = [
        "AWS4-HMAC-SHA256",
        amzDate,
        scope,
        createHash("sha256").update(canonicalRequest).digest("hex"),
      ].join("\n");

      const hmac = (key: Buffer | string, value: string) =>
        createHmac("sha256", key).update(value).digest();
      const dateKey = hmac(`AWS4${secretKey}`, dateStamp);
      const regionKey = hmac(dateKey, "auto");
      const serviceKey = hmac(regionKey, "s3");
      const signingKey = hmac(serviceKey, "aws4_request");
      const signature = hmac(signingKey, stringToSign).toString("hex");
      const authorization =
        `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`;

      const response = await fetch(new URL(canonicalUri, endpointUrl), {
        method: "HEAD",
        headers: {
          Authorization: authorization,
          "x-amz-content-sha256": payloadHash,
          "x-amz-date": amzDate,
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        console.warn("R2 connectivity check failed with HTTP status:", response.status);
        return res.status(502).json({
          ok: false,
          message:
            response.status === 403
              ? "R2 rejected the credentials or bucket permissions. Check the S3 Access Key, Secret Key, and Object Read & Write permission."
              : response.status === 404
                ? "R2 bucket was not found. Check R2_BUCKET_NAME."
                : "R2 did not accept the connectivity check. Verify the R2 settings.",
        });
      }

      return res.json({ ok: true, message: "Cloudflare R2 bucket connection successful." });
    } catch (error) {
      console.error(
        "R2 connectivity check error:",
        error instanceof Error ? error.message : "Unknown error",
      );
      return res.status(502).json({
        ok: false,
        message: "Unable to reach Cloudflare R2. Verify configuration and try again.",
      });
    }
  });

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
