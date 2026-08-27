'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Truck, Clock, CheckCircle2, AlertTriangle, ChevronRight, Phone, RefreshCw, XCircle } from 'lucide-react';
import type { Order } from '../../../types';
import { calculateOrderSla } from './deliverySlaService';
import { useTranslation } from '../../../i18n/useTranslation';

interface OrderClusterModalProps {
  orders: Order[];
  categoryTitle: string;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

const OrderClusterModal: React.FC<OrderClusterModalProps> = ({
  orders,
  categoryTitle,
  onClose,
  onSelectOrder,
}) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const now = new Date();

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                {isAr ? `مجموعة طلبات المسار (${orders.length})` : `Cluster Orders (${orders.length})`}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {categoryTitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* List of clustered orders */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
          {orders.map(order => {
            const orderIdStr = order.orderNumber || order.id.slice(0, 8);
            const st = order.orderStatus;
            const sla = calculateOrderSla(order, now, isAr);

            return (
              <div
                key={order.id}
                onClick={() => {
                  onSelectOrder(order);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs ${
                    st === 'delivered' ? 'bg-gray-500' : st === 'cancelled' ? 'bg-red-500' : st === 'shipped' ? 'bg-sky-500' : st === 'processing' ? 'bg-purple-600' : st === 'confirmed' ? 'bg-blue-600' : 'bg-amber-500'
                  }`}>
                    {st === 'delivered' && <CheckCircle2 size={16} />}
                    {st === 'cancelled' && <XCircle size={16} />}
                    {st === 'shipped' && <Truck size={16} className="animate-bounce" />}
                    {st === 'processing' && <RefreshCw size={16} className="animate-spin" />}
                    {st === 'confirmed' && <CheckCircle2 size={16} />}
                    {st === 'pending' && <Clock size={16} className="animate-pulse" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                        #{orderIdStr}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold truncate">
                        ({order.customerName})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      <span>{order.shippingAddress?.city || 'Casablanca'}</span>
                      <span>•</span>
                      <span className="font-extrabold text-gray-900 dark:text-white">{order.total} MAD</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* SLA Badge if Shipping */}
                  {st === 'shipped' && (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      sla.state === 'overdue' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 animate-pulse' :
                      sla.state === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 animate-pulse' :
                      sla.state === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' :
                      'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                    }`}>
                      {sla.remainingFormatted}
                    </span>
                  )}

                  {st === 'delivered' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {isAr ? 'تم التسليم' : 'Delivered'}
                    </span>
                  )}

                  <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrderClusterModal;
