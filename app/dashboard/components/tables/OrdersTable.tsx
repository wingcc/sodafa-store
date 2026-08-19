import { Eye, Pen, FileText } from 'lucide-react';

const recentOrders = [
  { id: '#ORD-00842', customer: 'Fatima Z.', date: 'Today, 14:32', items: 3, total: 1240, payment: 'Paid', status: 'Processing' },
  { id: '#ORD-00841', customer: 'Sara H.', date: 'Yesterday, 09:15', items: 2, total: 860, payment: 'Paid', status: 'Delivered' },
  { id: '#ORD-00840', customer: 'Nadia K.', date: '2 days ago, 16:40', items: 4, total: 2150, payment: 'Paid', status: 'Shipped' },
  { id: '#ORD-00839', customer: 'Leila M.', date: '3 days ago, 11:20', items: 1, total: 420, payment: 'Failed', status: 'Cancelled' },
  { id: '#ORD-00838', customer: 'Amina R.', date: '4 days ago, 08:55', items: 2, total: 1080, payment: 'Pending', status: 'Pending' },
];

const statusColors: Record<string, string> = {
  Processing: 'bg-[#f0ece0] text-[#8a7a4a]',
  Delivered: 'bg-[#e4f0e8] text-[#2a7a4a]',
  Shipped: 'bg-[#dce6f0] text-[#4a6a8a]',
  Cancelled: 'bg-[#f0e4e0] text-[#b55a4a]',
  Pending: 'bg-[#e8e0f0] text-[#6a4a8a]',
};

const paymentColors: Record<string, string> = {
  Paid: 'bg-[#e4f0e8] text-[#2a7a4a]',
  Failed: 'bg-[#f0e4e0] text-[#b55a4a]',
  Pending: 'bg-[#f0ece0] text-[#8a7a4a]',
};

export default function OrdersTable() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#f0ece8]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-[#2d2420]">Recent Orders</h3>
        <a href="/orders" className="text-xs text-rose-600 font-medium">View all</a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#8f7e72] border-b border-[#f0ece8]">
              <th className="pb-2 font-medium">Order ID</th>
              <th className="pb-2 font-medium">Customer</th>
              <th className="pb-2 font-medium">Total</th>
              <th className="pb-2 font-medium">Payment</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-[#f0ece8] last:border-0">
                <td className="py-3 font-medium">{order.id}</td>
                <td>
                  <div>
                    <div>{order.customer}</div>
                    <div className="text-xs text-[#8f7e72]">{order.date}</div>
                  </div>
                </td>
                <td className="font-semibold">MAD {order.total.toLocaleString()}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentColors[order.payment] || 'bg-gray-100'}`}>
                    {order.payment}
                  </span>
                </td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="text-right">
                  <button className="p-1 hover:bg-[#f0ece8] rounded"><Eye className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-[#f0ece8] rounded"><Pen className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-[#f0ece8] rounded"><FileText className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}