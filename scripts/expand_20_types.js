const fs=require('fs');
function read(p){ return fs.readFileSync(p,'utf8'); }
function write(p,c){ fs.writeFileSync(p,c,'utf8'); }

// 1. Supabase types
let t=read('lib/supabase/types.ts');
if(!t.includes("'account'")){
  t=t.replace(
    "notification_type: 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system' | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security';",
    "notification_type: 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system' | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security' | 'account' | 'message' | 'achievement' | 'reminder' | 'subscription' | 'support' | 'analytics' | 'team' | 'event' | 'custom';"
  );
  write('lib/supabase/types.ts', t);
  console.log("supabase types expanded to 20+2");
}

// 2. Dashboard types
let d=read('app/dashboard/types/index.ts');
if(!d.includes("'account'")){
  d=d.replace(
    "export type NotificationType = 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system' | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security';",
    "export type NotificationType = 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system' | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security' | 'account' | 'message' | 'achievement' | 'reminder' | 'subscription' | 'support' | 'analytics' | 'team' | 'event' | 'custom';"
  );
  write('app/dashboard/types/index.ts', d);
  console.log("dashboard types expanded");
}

// 3. NotificationService
let s=read('lib/services/notificationService.ts');
if(!s.includes("'account'")){
  s=s.replace(
    "export type NotificationType = 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system' | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security';",
    "export type NotificationType = 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system' | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security' | 'account' | 'message' | 'achievement' | 'reminder' | 'subscription' | 'support' | 'analytics' | 'team' | 'event' | 'custom';"
  );
  // Also expand TYPE_ALIASES if needed (keep as is)
  write('lib/services/notificationService.ts', s);
  console.log("service types expanded");
}
// Expand typeMap in service
let s2=read('lib/services/notificationService.ts');
if(!s2.includes("account: 'notify_account'")){
  s2=s2.replace(
    "      social: 'notify_social',\n      security: 'notify_security_events',",
    "      social: 'notify_social',\n      security: 'notify_security_events',\n      account: 'notify_account',\n      message: 'notify_message',\n      achievement: 'notify_achievement',\n      reminder: 'notify_reminder',\n      subscription: 'notify_subscription',\n      support: 'notify_support',\n      analytics: 'notify_analytics',\n      team: 'notify_team',\n      event: 'notify_event',\n      custom: 'notify_custom',"
  );
  write('lib/services/notificationService.ts', s2);
  console.log("service typeMap expanded");
}
// Also need to update getPreferences keys list
let s3=read('lib/services/notificationService.ts');
if(!s3.includes("'notify_account'")){
  s3=s3.replace(
    "          'notify_social',",
    "          'notify_social',\n          'notify_account',\n          'notify_message',\n          'notify_achievement',\n          'notify_reminder',\n          'notify_subscription',\n          'notify_support',\n          'notify_analytics',\n          'notify_team',\n          'notify_event',\n          'notify_custom',"
  );
  // Also defaults
  s3=s3.replace(
    "        notify_social: true,",
    "        notify_social: true,\n        notify_account: true,\n        notify_message: true,\n        notify_achievement: true,\n        notify_reminder: true,\n        notify_subscription: true,\n        notify_support: true,\n        notify_analytics: true,\n        notify_team: true,\n        notify_event: true,\n        notify_custom: true,"
  );
  // second defaults
  s3=s3.replace(
    "      notify_social: true,\n      notify_product",
    "      notify_social: true,\n      notify_account: true,\n      notify_message: true,\n      notify_achievement: true,\n      notify_reminder: true,\n      notify_subscription: true,\n      notify_support: true,\n      notify_analytics: true,\n      notify_team: true,\n      notify_event: true,\n      notify_custom: true,\n      notify_product"
  );
  write('lib/services/notificationService.ts', s3);
  console.log("service prefs expanded");
}

// 4. Client
let c=read('lib/notifications/client.ts');
if(!c.includes("'account'")){
  c=c.replace(
    "export type NotificationType =\n  | 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system'\n  | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security';",
    "export type NotificationType =\n  | 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system'\n  | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security'\n  | 'account' | 'message' | 'achievement' | 'reminder' | 'subscription' | 'support' | 'analytics' | 'team' | 'event' | 'custom';"
  );
  write('lib/notifications/client.ts', c);
  console.log("client types expanded");
}

// 5. Preferences route
let p=read('app/api/admin/notifications/preferences/route.ts');
if(!p.includes("'notify_account'")){
  p=p.replace(
    "  'notify_social',",
    "  'notify_social',\n  'notify_account',\n  'notify_message',\n  'notify_achievement',\n  'notify_reminder',\n  'notify_subscription',\n  'notify_support',\n  'notify_analytics',\n  'notify_team',\n  'notify_event',\n  'notify_custom',"
  );
  p=p.replace(
    "  notify_social: true,",
    "  notify_social: true,\n  notify_account: true,\n  notify_message: true,\n  notify_achievement: true,\n  notify_reminder: true,\n  notify_subscription: true,\n  notify_support: true,\n  notify_analytics: true,\n  notify_team: true,\n  notify_event: true,\n  notify_custom: true,"
  );
  write('app/api/admin/notifications/preferences/route.ts', p);
  console.log("prefs route expanded");
}

// 6. Visuals
let v=read('app/dashboard/components/notifications/notificationVisuals.tsx');
if(!v.includes("Headphones")){
  v=v.replace(
    "import {\n  ShoppingBag,\n  Star,\n  Package,\n  CreditCard,\n  Truck,\n  Gift,\n  Info,\n  User,\n  TrendingUp,\n  ShieldAlert,\n  Bell,\n  Tag,\n  Users,\n  AlertTriangle,\n  ShoppingCart,\n} from 'lucide-react';",
    "import {\n  ShoppingBag,\n  Star,\n  Package,\n  CreditCard,\n  Truck,\n  Gift,\n  Info,\n  User,\n  TrendingUp,\n  ShieldAlert,\n  Bell,\n  Tag,\n  Users,\n  AlertTriangle,\n  ShoppingCart,\n  Settings,\n  MessageSquare,\n  Award,\n  Calendar,\n  Headphones,\n  BarChart3,\n  UsersRound,\n  Megaphone,\n  Plus,\n} from 'lucide-react';"
  );
  write('app/dashboard/components/notifications/notificationVisuals.tsx', v);
  console.log("visuals imports expanded");
}
let v2=read('app/dashboard/components/notifications/notificationVisuals.tsx');
if(!v2.includes("account:")){
  v2=v2.replace(
    "    security: <ShieldAlert size={size} className=\"text-white\" />,\n    stock: <TrendingUp size={size} className=\"text-white\" />,\n    customer: <User size={size} className=\"text-white\" />,",
    "    security: <ShieldAlert size={size} className=\"text-white\" />,\n    account: <Settings size={size} className=\"text-white\" />,\n    message: <MessageSquare size={size} className=\"text-white\" />,\n    achievement: <Award size={size} className=\"text-white\" />,\n    reminder: <Calendar size={size} className=\"text-white\" />,\n    subscription: <Bell size={size} className=\"text-white\" />,\n    support: <Headphones size={size} className=\"text-white\" />,\n    analytics: <BarChart3 size={size} className=\"text-white\" />,\n    team: <UsersRound size={size} className=\"text-white\" />,\n    event: <Megaphone size={size} className=\"text-white\" />,\n    custom: <Plus size={size} className=\"text-white\" />,\n    stock: <TrendingUp size={size} className=\"text-white\" />,\n    customer: <User size={size} className=\"text-white\" />,"
  );
  // Also need to handle the non-white version for getTypeIcon (first map)
  v2=v2.replace(
    "    security: <ShieldAlert size={size} />,\n    // legacy fallbacks keep old Header look if DB still has stock/customer\n    stock: <TrendingUp size={size} />,\n    customer: <User size={size} />,",
    "    security: <ShieldAlert size={size} />,\n    account: <Settings size={size} />,\n    message: <MessageSquare size={size} />,\n    achievement: <Award size={size} />,\n    reminder: <Calendar size={size} />,\n    subscription: <Bell size={size} />,\n    support: <Headphones size={size} />,\n    analytics: <BarChart3 size={size} />,\n    team: <UsersRound size={size} />,\n    event: <Megaphone size={size} />,\n    custom: <Plus size={size} />,\n    // legacy fallbacks keep old Header look if DB still has stock/customer\n    stock: <TrendingUp size={size} />,\n    customer: <User size={size} />,"
  );
  write('app/dashboard/components/notifications/notificationVisuals.tsx', v2);
  console.log("visuals icons expanded");
}
let v3=read('app/dashboard/components/notifications/notificationVisuals.tsx');
if(!v3.includes("account: 'bg-")){
  v3=v3.replace(
    "    security: 'bg-red-50 text-red-600 border-red-200',\n    stock: 'bg-orange-50 text-orange-600 border-orange-200',\n    customer: 'bg-purple-50 text-purple-600 border-purple-200',",
    "    security: 'bg-red-50 text-red-600 border-red-200',\n    account: 'bg-violet-50 text-violet-600 border-violet-200',\n    message: 'bg-sky-50 text-sky-600 border-sky-200',\n    achievement: 'bg-amber-50 text-amber-600 border-amber-200',\n    reminder: 'bg-violet-50 text-violet-600 border-violet-200',\n    subscription: 'bg-emerald-50 text-emerald-600 border-emerald-200',\n    support: 'bg-blue-50 text-blue-600 border-blue-200',\n    analytics: 'bg-violet-50 text-violet-600 border-violet-200',\n    team: 'bg-teal-50 text-teal-600 border-teal-200',\n    event: 'bg-rose-50 text-rose-600 border-rose-200',\n    custom: 'bg-gray-50 text-gray-600 border-gray-200',\n    stock: 'bg-orange-50 text-orange-600 border-orange-200',\n    customer: 'bg-purple-50 text-purple-600 border-purple-200',"
  );
  write('app/dashboard/components/notifications/notificationVisuals.tsx', v3);
  console.log("visuals typeClasses expanded");
}
let v4=read('app/dashboard/components/notifications/notificationVisuals.tsx');
if(v4.includes("security: 'Orders'") || v4.includes("security: 'Security',\n    stock:")){
  // need to expand labels
  if(!v4.includes("account: 'Account'")){
    v4=v4.replace(
      "    security: 'Security',\n    stock: 'Inventory',\n    customer: 'Social',",
      "    security: 'Security',\n    account: 'Account',\n    message: 'Messages',\n    achievement: 'Achievements',\n    reminder: 'Reminders',\n    subscription: 'Subscription',\n    support: 'Support',\n    analytics: 'Analytics',\n    team: 'Team',\n    event: 'Events',\n    custom: 'Custom',\n    stock: 'Inventory',\n    customer: 'Social',"
    );
    write('app/dashboard/components/notifications/notificationVisuals.tsx', v4);
    console.log("visuals labels expanded");
  }
}
let v5=read('app/dashboard/components/notifications/notificationVisuals.tsx');
if(!v5.includes("account: 'bg-violet-500")){
  v5=v5.replace(
    "    security: 'bg-red-500 border-red-500',\n    stock: 'bg-orange-500 border-orange-500',\n    customer: 'bg-purple-500 border-purple-500',",
    "    security: 'bg-red-500 border-red-500',\n    account: 'bg-violet-500 border-violet-500',\n    message: 'bg-sky-500 border-sky-500',\n    achievement: 'bg-amber-500 border-amber-500',\n    reminder: 'bg-violet-500 border-violet-500',\n    subscription: 'bg-emerald-500 border-emerald-500',\n    support: 'bg-blue-500 border-blue-500',\n    analytics: 'bg-violet-500 border-violet-500',\n    team: 'bg-teal-500 border-teal-500',\n    event: 'bg-rose-500 border-rose-500',\n    custom: 'bg-gray-500 border-gray-500',\n    stock: 'bg-orange-500 border-orange-500',\n    customer: 'bg-purple-500 border-purple-500',"
  );
  write('app/dashboard/components/notifications/notificationVisuals.tsx', v5);
  console.log("visuals header bg expanded");
}

console.log("all done");
