const fs=require('fs'), path=require('path');
const envPath=path.join(__dirname,'..','.env');
let envContent=fs.readFileSync(envPath,'utf8').replace(/^\uFEFF/,'');
let env={}; envContent.split(/\r?\n/).forEach(l=>{const m=l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/); if(m) env[m[1]]=m[2].trim();});
async function main(){
  const {createClient}=require('@supabase/supabase-js');
  const admin=createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const {count} = await admin.from('notifications').select('*',{count:'exact',head:true});
  console.log("current total", count);
  const extra = [
    {type:'account', title:'Account updated', message:'Your password was changed successfully from Casablanca.', priority:'medium', starred:false, action_url:'/dashboard/settings', metadata:{action:'password_change'}},
    {type:'message', title:'New message from Sarah', message:'Sarah J. sent you a message: "Is this still available?"', priority:'medium', starred:false, action_url:'/dashboard/customers', metadata:{senderName:'Sarah J.'}},
    {type:'achievement', title:'Achievement unlocked!', message:'You earned the "100 Sales" badge — congratulations!', priority:'low', starred:true, action_url:'/dashboard/analytics', metadata:{achievementName:'100 Sales'}},
    {type:'reminder', title:'Reminder: Complete your profile', message:"Don't forget to complete your store profile by Dec 20th.", priority:'medium', starred:false, action_url:'/dashboard/settings', metadata:{dueDate:'2024-12-20'}},
    {type:'subscription', title:'Subscription renewed', message:'Your Pro Plan subscription has been renewed — next billing Jan 15.', priority:'high', starred:false, action_url:'/dashboard/settings', metadata:{planName:'Pro Plan'}},
    {type:'support', title:'Support ticket #12345 resolved', message:'Your support request has been resolved by Agent Karim.', priority:'high', starred:false, action_url:'/dashboard/support', metadata:{ticketId:'12345'}},
    {type:'analytics', title:'Weekly report ready', message:'Revenue reached $5,000 (+15%) this week — view insights.', priority:'low', starred:false, action_url:'/dashboard/analytics', metadata:{metric:'revenue',value:5000}},
    {type:'team', title:'Alex mentioned you', message:'Alex M. mentioned you in Project Alpha — check the comment.', priority:'medium', starred:false, action_url:'/dashboard/team', metadata:{userName:'Alex M.'}},
    {type:'event', title:'Black Friday Sale is coming!', message:'Black Friday Sale starts Nov 24th — prepare your store!', priority:'medium', starred:false, action_url:'/dashboard/events', metadata:{eventName:'Black Friday Sale'}},
    {type:'custom', title:'Custom plugin notification', message:'A custom integration sent a notification — check details.', priority:'medium', starred:false, action_url:'/dashboard/settings', metadata:{source:'plugin'}},
  ];
  let inserted=0;
  for(const n of extra){
    const payload={...n, read:false, timestamp: new Date(Date.now() - Math.floor(Math.random()*5*24*3600*1000)).toISOString()};
    let {error}=await admin.from('notifications').insert(payload);
    if(error){
      if(/column.*does not exist|Could not find.*column/i.test(error.message) || /invalid input value for enum/i.test(error.message)){
        // fallback without new type -> map to system
        const fallback={...payload, type:'system'};
        delete fallback.starred; delete fallback.priority; delete fallback.metadata;
        // try with old columns
        let p2={type:fallback.type, title:fallback.title, message:fallback.message, read:fallback.read, action_url:fallback.action_url, timestamp:fallback.timestamp};
        const {error:e2}=await admin.from('notifications').insert(p2);
        if(!e2){ inserted++; console.log("fallback inserted", n.type, "as system"); }
        else console.log("fallback failed", n.type, e2.message);
      } else console.log("failed", n.type, error.message);
    } else { inserted++; console.log("inserted", n.type); }
  }
  console.log("done", inserted, "of", extra.length);
  const {count:final} = await admin.from('notifications').select('*',{count:'exact',head:true});
  console.log("final total", final);
}
main().catch(e=>{console.error(e); process.exit(1);});
