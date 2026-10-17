import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { getDatabase } from "../mongodb-server.js";
import { getAdminSession, requireAdmin } from "../admin-session.js";
import { readUserSession } from "../user-session.js";

type Req = IncomingMessage & { body?: any; query?: Record<string,string|string[]|undefined> };
function json(res:ServerResponse,status:number,body:unknown){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(body));}
function param(v:string|string[]|undefined){return String(Array.isArray(v)?v[0]:v||"");}
export default async function handler(req:Req,res:ServerResponse){
  const db=await getDatabase();
  const orders=db.collection("orders");
  const admin=getAdminSession(req);
  const user=readUserSession(req);
  if(req.method==="GET"){
    if(!admin&&!user)return json(res,401,{ok:false,error:"Please sign in to view orders."});
    const filter=admin?{}:{userId:user!.id};
    const items=await orders.find(filter,{projection:{_id:0}}).sort({createdAt:-1}).limit(500).toArray();
    return json(res,200,{ok:true,orders:items});
  }
  if(req.method==="POST"){
    const body=req.body&&typeof req.body==="object"?req.body:{};
    const requestedPaymentMethod=String(body.paymentMethod||"Cash on Delivery").trim();
    if(requestedPaymentMethod!=="Cash on Delivery")return json(res,400,{ok:false,error:"Only Cash on Delivery is currently enabled. Online payments must be configured and verified before use."});
    const rawItems=Array.isArray(body.items)?body.items:[];
    if(!rawItems.length||rawItems.length>50)return json(res,400,{ok:false,error:"Cart is empty or has too many items."});
    const products=db.collection("products");
    const normalized:any[]=[];
    let subtotal=0;
    for(const raw of rawItems){
      const id=String(raw?.product?.id||raw?.productId||"").slice(0,100);
      const quantity=Math.floor(Number(raw?.quantity));
      if(!id||!Number.isInteger(quantity)||quantity<1||quantity>99)return json(res,400,{ok:false,error:"Invalid cart item."});
      const product=await products.findOne({id},{projection:{_id:0}});
      if(!product)return json(res,409,{ok:false,error:"A product in your cart is no longer available."});
      if(Number(product.stock)<quantity)return json(res,409,{ok:false,error:"Not enough stock for "+String(product.name||"this product")+"."});
      const price=Number(product.price);
      if(!Number.isFinite(price)||price<0)return json(res,409,{ok:false,error:"Product price is invalid."});
      subtotal+=price*quantity;
      normalized.push({product,quantity});
    }
    const shipping=subtotal>5000||subtotal===0?0:250;
    let requestedDiscount=0;
    const couponCode=String(body.couponCode||"").trim().toUpperCase().slice(0,60);
    if(couponCode){
      const coupon=await db.collection("coupons").findOne({code:couponCode});
      if(!coupon)return json(res,400,{ok:false,error:"Coupon is invalid or expired."});
      if(coupon.minSpend&&subtotal<Number(coupon.minSpend))return json(res,400,{ok:false,error:"Minimum spend for this coupon has not been reached."});
      if(coupon.isActive===false||coupon.active===false)return json(res,400,{ok:false,error:"This coupon is inactive."});
      if(coupon.expiryDate){const expiry=Date.parse(String(coupon.expiryDate));if(Number.isFinite(expiry)&&expiry<Date.now())return json(res,400,{ok:false,error:"Coupon has expired."});}
      const amount=Number(coupon.discount)||0;
      requestedDiscount=String(coupon.type||"").toLowerCase()==="fixed"?amount:subtotal*amount/100;
      requestedDiscount=Math.max(0,Math.min(requestedDiscount,subtotal));
    }
    const total=Math.max(0,subtotal+shipping-requestedDiscount);
    const orderId="PAK-"+randomUUID().replace(/-/g,"").slice(0,12).toUpperCase();
    const affiliateId=String(body.affiliateId||"").slice(0,120);
    const now=new Date().toISOString();
    const order={id:orderId,userId:user?.id||"guest-user",items:normalized.map(x=>({product:x.product,quantity:x.quantity})),subtotal,shipping,discount:requestedDiscount,total,status:"Pending",paymentMethod:String(body.paymentMethod||"Cash on Delivery").slice(0,60),shippingAddress:body.shippingAddress||{},billingAddress:body.billingAddress||body.shippingAddress||{},date:new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),createdAt:now,...(affiliateId?{affiliateId}: {})};
    const changed:any[]=[];
    try{
      for(const item of normalized){
        const result=await products.updateOne({id:item.product.id,stock:{$gte:item.quantity}},{$inc:{stock:-item.quantity}});
        if(!result.modifiedCount)throw new Error("STOCK_CHANGED");
        changed.push(item);
      }
      await orders.insertOne(order);
      if(affiliateId && affiliateId !== user?.id){
        try {
          const affiliate=await db.collection("affiliates").findOne({id:affiliateId,status:"active",activated:true});
          if(affiliate){
            const config=await db.collection<{_id:string; commissionPercentage?:number}>("config").findOne({_id:"global"});
            const commissionAmount=normalized.reduce((sum,item)=>{
              if(item.product.affiliateEnabled===false)return sum;
              const type=String(item.product.commissionType||"percentage").toLowerCase();
              const configured=Number(item.product.commissionValue ?? item.product.affiliateCommissionRate ?? config?.commissionPercentage ?? 10);
              if(!Number.isFinite(configured)||configured<0)return sum;
              if(type==="fixed")return sum+Math.round(configured*item.quantity);
              const rate=Math.max(0,Math.min(100,configured));
              return sum+Math.round(Number(item.product.price)*item.quantity*rate/100);
            },0);
            await db.collection("referrals").insertOne({id:"ref-"+randomUUID(),affiliateId,referredUserId:user?.id||"guest-user",orderId,purchaseAmount:total,commissionAmount,status:"pending",date:order.date,type:"conversion",createdAt:now});
            await db.collection("affiliates").updateOne({id:affiliateId},{$inc:{totalReferrals:1}});
          }
        } catch(error) {
          console.error("Affiliate referral recording failed:",error instanceof Error?error.message:"unknown");
        }
      }
      const {_id,...safeOrder}=order as any;
      return json(res,201,{ok:true,order:safeOrder});
    }catch(error){
      for(const item of changed){try{await products.updateOne({id:item.product.id},{$inc:{stock:item.quantity}})}catch{}}
      console.error("Order creation failed:",error instanceof Error?error.message:"unknown");
      return json(res,409,{ok:false,error:"Order could not be saved. Please refresh your cart and try again."});
    }
  }
  if(req.method==="PATCH"){
    if(!requireAdmin(req,res))return;
    const id=param(req.query?.id)||String(req.body?.id||"");
    const status=String(req.body?.status||"");
    const allowed=["Pending","Processing","Shipped","Delivered","Cancelled","Completed"];
    if(!id||!allowed.includes(status))return json(res,400,{ok:false,error:"Invalid order ID or status."});
    const result=await orders.updateOne({id},{$set:{status,updatedAt:new Date().toISOString()}});
    if(!result.matchedCount)return json(res,404,{ok:false,error:"Order not found."});
    if(status==="Delivered"){
      await db.collection("referrals").updateMany({orderId:id,status:"pending"},{$set:{status:"cooling",deliveryDate:new Date().toISOString()}});
    }else if(status==="Cancelled"){
      await db.collection("referrals").updateMany({orderId:id,status:{$in:["pending","cooling"]}},{$set:{status:"rejected"}});
    }
    return json(res,200,{ok:true});
  }
  res.setHeader("Allow","GET, POST, PATCH");return json(res,405,{ok:false,error:"Method not allowed."});
}
