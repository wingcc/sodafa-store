import { Eye, Edit, Copy, Trash2 } from 'lucide-react';

const products = [
  { id: 1, name: 'Argan Hair Oil', sku: 'AHO-001', category: 'Hair Care', price: 79, salePrice: 99, stock: 342, status: 'In stock' },
  { id: 2, name: 'Rose Face Serum', sku: 'RFS-002', category: 'Skincare', price: 149, salePrice: null, stock: 28, status: 'Low stock' },
  // ...
];

export default function ProductsTable() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#f0ece8]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-[#2d2420]">Top Products</h3>
        <a href="/products" className="text-xs text-rose-600 font-medium">View all</a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#8f7e72] border-b border-[#f0ece8]">
              <th className="pb-2 font-medium">Product</th>
              <th className="pb-2 font-medium">SKU</th>
              <th className="pb-2 font-medium">Price</th>
              <th className="pb-2 font-medium">Stock</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 4).map((p) => (
              <tr key={p.id} className="border-b border-[#f0ece8] last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f5efe9] rounded-lg flex items-center justify-center text-[#b3a59a]">
                      <i className="fas fa-box"></i>
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-[#8f7e72]">{p.category}</div>
                    </div>
                  </div>
                </td>
                <td className="text-[#8f7e72]">{p.sku}</td>
                <td>
                  <span className="font-medium">MAD {p.price}</span>
                  {p.salePrice && <span className="text-xs text-[#b3a59a] line-through ml-1">MAD {p.salePrice}</span>}
                </td>
                <td>{p.stock}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    p.status === 'In stock' ? 'bg-[#e4f0e8] text-[#2a7a4a]' :
                    p.status === 'Low stock' ? 'bg-[#f0ece0] text-[#8a7a4a]' :
                    'bg-[#f0e4e0] text-[#b55a4a]'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="text-right">
                  <button className="p-1 hover:bg-[#f0ece8] rounded"><Eye className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-[#f0ece8] rounded"><Edit className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-[#f0ece8] rounded"><Copy className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-[#f0e4e0] rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}