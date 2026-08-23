const fs=require('fs');
const path=require('path');
const envPath=path.join(__dirname,'..','.env');
let envContent=fs.readFileSync(envPath,'utf8').replace(/^\uFEFF/,'');
let env={};
envContent.split(/\r?\n/).forEach(line=>{
  const m=line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if(m) env[m[1]]=m[2].trim();
});
async function main(){
  const {createClient}=require('@supabase/supabase-js');
  const admin=createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  // Check existing count
  const {count, error: e0} = await admin.from('notifications').select('*', {count:'exact', head:true});
  console.log("existing count:", count, e0?.message);
  if(count && count >= 15){
    console.log("Already has", count, "rows, skipping seed (idempotent guard). Use --force to override");
    if(!process.argv.includes('--force')) return;
  }
  const fake = [
    {type:'order', title:'New order received!', message:'Customer Fatima Zahra placed order #SDF-2026-0847 for 3 items — 249.99 MAD. Ship within 24h.', read:false, starred:true, priority:'urgent', action_url:'/dashboard/orders', metadata:{orderId:'SDF-2026-0847',amount:249.99,items:3}, timestamp: new Date(Date.now()-2*3600*1000).toISOString()},
    {type:'review', title:'New 5-star review', message:'Sarah Johnson left a 5-star review for "Premium Wireless Headphones" — "Absolutely love it!"', read:false, starred:false, priority:'high', action_url:'/dashboard/reviews', metadata:{productId:'PROD-2024-001',productName:'Premium Wireless Headphones',rating:5}, timestamp: new Date(Date.now()-5*3600*1000).toISOString()},
    {type:'payment', title:'Payment confirmed', message:'Payment of 89.99 MAD for order #SDF-2026-0846 has been confirmed via COD.', read:true, starred:false, priority:'medium', action_url:'/dashboard/orders', metadata:{orderId:'SDF-2026-0846',amount:89.99}, timestamp: new Date(Date.now()-24*3600*1000).toISOString()},
    {type:'shipping', title:'Package shipped', message:'Order #SDF-2026-0846 has been shipped. Tracking: TRK-7890-1234-5678 via Express.', read:false, starred:false, priority:'medium', action_url:'/dashboard/orders', metadata:{orderId:'SDF-2026-0846',trackingNumber:'TRK-7890-1234-5678'}, timestamp: new Date(Date.now()-2*24*3600*1000).toISOString()},
    {type:'promotion', title:'Flash sale: 20% off accessories!', message:'Limited time: 20% off all accessories for 24h. Use code FLASH20.', read:false, starred:true, priority:'high', action_url:'/dashboard/coupons', metadata:{promotionCode:'FLASH20',discount:20,category:'accessories'}, timestamp: new Date(Date.now()-3*3600*1000).toISOString()},
    {type:'system', title:'System maintenance scheduled', message:'Scheduled maintenance Dec 15, 2024 02:00–04:00 UTC — expect 2h downtime.', read:true, starred:false, priority:'medium', action_url:'/dashboard/settings', metadata:{maintenanceWindow:'2024-12-15 02:00:00',duration:'2 hours'}, timestamp: new Date(Date.now()-3*24*3600*1000).toISOString()},
    {type:'social', title:'New follower alert', message:'Jessica Martinez started following your store. Connect with your new follower!', read:false, starred:false, priority:'low', action_url:'/dashboard/customers', metadata:{followerName:'Jessica Martinez'}, timestamp: new Date(Date.now()-4*24*3600*1000).toISOString()},
    {type:'inventory', title:'Low stock warning', message:'Product "Wireless Charging Pad" has only 5 units remaining. Restock soon.', read:false, starred:false, priority:'high', action_url:'/dashboard/inventory', metadata:{productName:'Wireless Charging Pad',currentStock:5,reorderLevel:10}, timestamp: new Date(Date.now()-24*3600*1000).toISOString()},
    {type:'security', title:'New login detected', message:"New login from Paris, France on iPhone 15 Pro — if this wasn't you, change your password.", read:false, starred:true, priority:'urgent', action_url:'/dashboard/settings', metadata:{location:'Paris, France',device:'iPhone 15 Pro'}, timestamp: new Date(Date.now()-3600*1000).toISOString()},
    {type:'product', title:'Back in stock!', message:'Product "Noise-Canceling Headphones" is back in stock — available in all colors.', read:false, starred:false, priority:'medium', action_url:'/dashboard/products', metadata:{productName:'Noise-Canceling Headphones',availableColors:['Black','White','Blue']}, timestamp: new Date(Date.now()-12*3600*1000).toISOString()},
    {type:'review', title:'Review reply received', message:'Admin replied to your review for "Smart Watch Pro". Check the response.', read:true, starred:false, priority:'low', action_url:'/dashboard/reviews', metadata:{productName:'Smart Watch Pro',reviewId:'REV-2024-001'}, timestamp: new Date(Date.now()-2*24*3600*1000).toISOString()},
    {type:'order', title:'Order delivered successfully', message:'Order #SDF-2026-0841 has been delivered. Thank you for shopping with us!', read:true, starred:false, priority:'medium', action_url:'/dashboard/orders', metadata:{orderId:'SDF-2026-0841'}, timestamp: new Date(Date.now()-6*3600*1000).toISOString()},
    {type:'system', title:'Welcome to SODFA Marketplace!', message:"We're excited to have you on board. Explore 100% natural Moroccan beauty & skincare.", read:true, starred:false, priority:'low', action_url:'/dashboard', metadata:{welcome:true}, timestamp: new Date(Date.now()-7*24*3600*1000).toISOString()},
    {type:'inventory', title:'Out of stock — urgent', message:'Volumizing Mascara - Black (Brown variant) is out of stock. 0 units.', read:false, starred:false, priority:'urgent', action_url:'/dashboard/inventory', metadata:{productName:'Volumizing Mascara - Black',currentStock:0}, timestamp: new Date(Date.now()-30*60*1000).toISOString()},
    {type:'payment', title:'3 orders have pending COD payments', message:'3 orders have pending Cash on Delivery payments — total 412.50 MAD.', read:false, starred:false, priority:'high', action_url:'/dashboard/payments', metadata:{pendingOrders:3,totalPending:412.50}, timestamp: new Date(Date.now()-8*3600*1000).toISOString()},
    {type:'customer', title:'New Customer — Hajar Amrani', message:'Hajar Amrani registered on SODFA MARKETPLACE — welcome her!', read:true, starred:false, priority:'medium', action_url:'/dashboard/customers', metadata:{customerName:'Hajar Amrani'}, timestamp: new Date(Date.now()-5*24*3600*1000).toISOString()},
    {type:'stock', title:'Low Stock Alert — Glossy Lipstick', message:'Glossy Lipstick - Rose Gold has only 8 units remaining.', read:false, starred:false, priority:'high', action_url:'/dashboard/inventory', metadata:{productName:'Glossy Lipstick - Rose Gold',currentStock:8}, timestamp: new Date(Date.now()-9*3600*1000).toISOString()},
    {type:'shipping', title:'Delivery delayed — weather', message:'Your delivery for order #SDF-2026-0842 has been delayed due to weather conditions.', read:true, starred:false, priority:'medium', action_url:'/dashboard/orders', metadata:{orderId:'SDF-2026-0842',reason:'weather'}, timestamp: new Date(Date.now()-(24+3)*3600*1000).toISOString()},
    {type:'product', title:'New arrival: Argan Hair Serum', message:'New product "Argan Hair Serum — 100% Natural" is now available in store.', read:false, starred:false, priority:'low', action_url:'/dashboard/products', metadata:{productName:'Argan Hair Serum'}, timestamp: new Date(Date.now()-6*24*3600*1000).toISOString()},
    {type:'security', title:'Security check — 2FA enabled', message:'Two-factor authentication was enabled for your admin account.', read:true, starred:true, priority:'high', action_url:'/dashboard/settings', metadata:{action:'2FA enabled'}, timestamp: new Date(Date.now()-(2*24+4)*3600*1000).toISOString()},
    {type:'promotion', title:'Promotion ending soon', message:'Your "WELCOME20" coupon expires in 3 hours — 124 uses remaining.', read:false, starred:false, priority:'urgent', action_url:'/dashboard/coupons', metadata:{code:'WELCOME20',usesLeft:124}, timestamp: new Date(Date.now()-45*60*1000).toISOString()},
    {type:'order', title:'Order cancelled by customer', message:'Order #SDF-2026-0843 was cancelled by Nadia Chraibi — refund initiated.', read:true, starred:false, priority:'medium', action_url:'/dashboard/orders', metadata:{orderId:'SDF-2026-0843',customerName:'Nadia Chraibi'}, timestamp: new Date(Date.now()-10*24*3600*1000).toISOString()},
    {type:'customer', title:'Customer message — Fatima', message:'Fatima Zahra sent a message: "When will my order arrive?"', read:false, starred:false, priority:'low', action_url:'/dashboard/customers', metadata:{customerName:'Fatima Zahra'}, timestamp: new Date(Date.now()-15*3600*1000).toISOString()},
    {type:'review', title:'New 3-star review — needs attention', message:'Yasmine Toumi left a 3-star review on "Volumizing Mascara" — check feedback.', read:false, starred:false, priority:'high', action_url:'/dashboard/reviews', metadata:{productName:'Volumizing Mascara',rating:3}, timestamp: new Date(Date.now()-18*3600*1000).toISOString()},
  ];
  let inserted=0;
  for(const n of fake){
    // Try with new columns, fallback to old columns if DDL not yet applied
    let payload = {type:n.type, title:n.title, message:n.message, read:n.read, starred:n.starred, priority:n.priority, action_url:n.action_url, metadata:n.metadata, timestamp:n.timestamp};
    let {error} = await admin.from('notifications').insert(payload);
    if(error){
      if(/column.*does not exist|Could not find.*column/i.test(error.message)){
        // retry without new columns
        let fallback = {type: n.type === 'social' ? 'customer' : n.type === 'inventory' ? 'stock' : n.type, title:n.title, message:n.message, read:n.read, action_url:n.action_url, timestamp:n.timestamp};
        // map new types to legacy if needed
        if(!['order','customer','stock','review','payment','system'].includes(fallback.type)){
          fallback.type='system';
        }
        const {error: e2}=await admin.from('notifications').insert(fallback);
        if(e2) console.log("fallback failed", e2.message);
        else { inserted++; console.log("inserted fallback", n.title); }
      } else {
        console.log("insert failed", error.message, n.title);
      }
    } else {
      inserted++; console.log("inserted", n.title, n.type, n.priority, n.starred?"starred":"");
    }
  }
  console.log("done inserted", inserted, "of", fake.length);
  const {count: finalCount} = await admin.from('notifications').select('*',{count:'exact',head:true});
  console.log("total now", finalCount);
}
main().catch(e=>{console.error(e); process.exit(1)});
