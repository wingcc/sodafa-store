// app/dashboard/pages/store-manager/promotional-banners/services/bannerService.ts

import { createClient } from "@/lib/supabase/client";
import { Banner } from "../types";

const supabase = createClient();

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("order", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function toggleBannerStatus(id: string): Promise<Banner> {
  const { data: current } = await supabase
    .from("banners")
    .select("active")
    .eq("id", id)
    .single();
  if (!current) throw new Error("Banner not found");

  const newActive = !current.active;
  const { data, error } = await supabase
    .from("banners")
    .update({ active: newActive })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Banner;
}

export async function upsertBanner(banner: Banner): Promise<Banner> {
  const { data, error } = await supabase
    .from("banners")
    .upsert({
      id: banner.id,
      title: banner.title,
      discount: banner.discount,
      active: banner.active,
      image_url: banner.imageUrl || null,
      link: banner.link || null,
      order: banner.order,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Banner;
}

export async function reorderBanners(updates: { id: string; order: number }[]): Promise<void> {
  for (const update of updates) {
    const { error } = await supabase
      .from("banners")
      .update({ order: update.order })
      .eq("id", update.id);
    if (error) throw new Error(error.message);
  }
}