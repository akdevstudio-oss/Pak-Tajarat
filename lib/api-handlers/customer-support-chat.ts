import type { IncomingMessage, ServerResponse } from "node:http";

type Request = IncomingMessage & { body?: any };
type CatalogItem = { name?: string; price?: string; category?: string; stock?: string };

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: Request, res: ServerResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const message = String(body.message || "").trim().slice(0, 1000);
  if (!message) return json(res, 400, { ok: false, error: "Please enter a question." });

  const q = message.toLowerCase();
  const catalog: CatalogItem[] = Array.isArray(body.catalogContext) ? body.catalogContext.slice(0, 10) : [];
  let reply = "";

  if (/delivery|deliver|shipping|tcs|leopard|kitny din|kitne din|kab tak|pohanch/.test(q)) {
    reply = "Website par delivery estimate 2–4 business days diya gaya hai. Remote areas aur courier conditions ki wajah se time vary kar sakta hai. Order confirm karne se pehle WhatsApp support se apne area ka estimate confirm kar lein.";
  } else if (/cash on delivery|\bcod\b|pay on delivery|darwaz|cash/.test(q)) {
    reply = "Ji, website par Cash on Delivery (COD) listed hai. Order place karte waqt checkout par available payment option select karein. Agar option show na ho to WhatsApp support se confirm karein.";
  } else if (/return|refund|wapas|replace|exchange/.test(q)) {
    reply = "Website ki listed policy 7-day returns hai. Return ki eligibility product condition aur policy terms par depend karti hai. Request se pehle support se reason aur process confirm karein.";
  } else if (/payment|jazzcash|easypaisa|bank transfer|card/.test(q)) {
    reply = "Website par COD, JazzCash, Easypaisa aur bank transfer options listed hain. Checkout par jo options actually available hon, unhi ko use karein; card payment ki availability assume na karein.";
  } else if (/contact|whatsapp|phone|number|email|support|rabta/.test(q)) {
    reply = "Pak-Tijarat support: WhatsApp +92 326 1604808. Aap wa.me/923261604808 par message kar sakte hain. Email: alikhanxada1001@gmail.com.";
  } else if (/product|products|price|bag|backpack|stock|available|popular|hot|discount|catalog|catalogue|qeemat|rate|item/.test(q)) {
    if (catalog.length) {
      reply = "Yeh current catalog information hai:\n" + catalog.map((p) => {
        const name = String(p.name || "Product").slice(0, 120);
        const price = String(p.price || "Price not listed").slice(0, 40);
        const stock = String(p.stock || "Stock status not listed").slice(0, 40);
        return "• " + name + " — " + price + " (" + stock + ")";
      }).join("\n");
      reply += "\n\nFinal price aur availability order se pehle product page par confirm kar lein.";
    } else {
      reply = "Is waqt mujhe current product list nahi mil rahi. Website ke Products page par available items check karein ya WhatsApp +92 326 1604808 par pooch lein.";
    }
  } else {
    reply = "Main delivery, COD, returns, payment options aur current product information mein madad kar sakta hoon. Aap apna sawal in topics mein pooch lein, ya WhatsApp +92 326 1604808 par rabta karein.";
  }

  return json(res, 200, { ok: true, reply });
}
