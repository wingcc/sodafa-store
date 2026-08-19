// app/dashboard/pages/store-manager/promotional-banners/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Eye, EyeOff, Trash2, ChevronUp, ChevronDown, Copy, Check } from "lucide-react";
import Badge from "@/app/dashboard/components/ui/Badge";
import RefreshButton from "@/app/dashboard/components/ui/RefreshButton";
import { useToast } from "@/lib/toast";
import BannerEditorModal from "./components/BannerEditorModal";
import { fetchBanners, deleteBanner, toggleBannerStatus, upsertBanner, reorderBanners } from "./services/bannerService";
import { Banner } from "./types";

export default function PromotionalBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch (error) {
      addToast("error", "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleRefresh = () => {
    loadBanners();
    addToast("info", "Banners refreshed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      addToast("success", "Banner deleted");
    } catch (error) {
      addToast("error", "Failed to delete banner.");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await toggleBannerStatus(id);
      setBanners((prev) => prev.map((b) => (b.id === id ? updated : b)));
      addToast("success", `Banner ${updated.active ? "activated" : "deactivated"}`);
    } catch (error) {
      addToast("error", "Failed to toggle status.");
    }
  };

  const handleSaveBanner = async (banner: Banner) => {
    try {
      const saved = await upsertBanner(banner);
      setBanners((prev) => {
        const exists = prev.find((b) => b.id === saved.id);
        if (exists) return prev.map((b) => (b.id === saved.id ? saved : b));
        return [...prev, saved];
      });
      addToast("success", `Banner "${saved.title}" saved`);
    } catch (error) {
      addToast("error", "Failed to save banner.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const reordered = [...banners];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    // Update local state optimistically
    setBanners(reordered);

    // Update order in DB
    try {
      await reorderBanners(reordered.map((b, idx) => ({ id: b.id, order: idx })));
    } catch (error) {
      addToast("error", "Failed to reorder banners.");
      // Revert
      await loadBanners();
    }
  };

  const copyLink = (link: string, id: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditor = (banner?: Banner) => {
    setEditingBanner(banner || null);
    setIsModalOpen(true);
  };

  const closeEditor = () => {
    setEditingBanner(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Promotional Banners</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage banners shown on your store ({banners.length} banners)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
          >
            <Plus size={14} />
            Add Banner
          </button>
          <RefreshButton onRefresh={handleRefresh} size="md" variant="default" />
        </div>
      </div>

      {/* Banner Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-gray-400">
            <Plus size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No banners yet. Create your first banner!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              {/* Image / Gradient */}
              <div
                className="relative h-40 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden"
                style={
                  banner.imageUrl
                    ? {
                        backgroundImage: `url(${banner.imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}
                }
              >
                {!banner.imageUrl && (
                  <div className="text-center text-white p-4">
                    <p className="text-xl font-bold">{banner.title}</p>
                    <p className="text-sm opacity-80">{banner.discount}</p>
                  </div>
                )}
                {/* Status badge on image */}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={banner.active ? "success" : "default"}
                    size="sm"
                    dot
                    className="shadow-md"
                  >
                    {banner.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 line-clamp-1">{banner.title}</h4>
                    {banner.discount && (
                      <p className="text-sm text-gray-500">{banner.discount}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {/* Reorder buttons */}
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === banners.length - 1}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                  {banner.link && (
                    <button
                      onClick={() => copyLink(banner.link!, banner.id)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-xs"
                      title="Copy link"
                    >
                      {copiedId === banner.id ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span className="hidden sm:inline">Copy Link</span>
                    </button>
                  )}
                  <button
                    onClick={() => openEditor(banner)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(banner.id)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors"
                    title={banner.active ? "Deactivate" : "Activate"}
                  >
                    {banner.active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <BannerEditorModal
        isOpen={isModalOpen}
        onClose={closeEditor}
        banner={editingBanner}
        onSave={handleSaveBanner}
      />
    </div>
  );
}