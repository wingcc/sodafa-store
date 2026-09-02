// lib/public-content.ts
// Public-site content loader.
//
// Strategy: Start with an empty default config, then overlay all data from
// Supabase (homepage_content table). All managed content comes from the database.
// No config.json dependency — everything is database-driven.

import { createClient } from "@/lib/supabase/client";
import type {
  SodfaConfig,
  SiteConfig,
  HeroConfig,
  PricingConfig,
  AboutConfig,
  VideoConfig,
  LegalConfig,
  StatItem,
  TrustItem,
  OilItem,
  BenefitItem,
  TestimonialItem,
  FaqItem,
  OrderStep,
  SectionConfig,
} from "@/app/sections/common/types";

type Db = ReturnType<typeof createClient>;

// Empty default config — all real data comes from the database
function getDefaultConfig(): SodfaConfig {
  return {
    site: {
      brandName: "SODFA",
      logo: "/assets/Image/NavbarLogo.png",
      NavbarLogo: "/assets/Image/NavbarLogo.png",
      footerLogo: "/assets/Image/FooterLogo.jpg",
    },
    pricing: { label: "", current: 0, old: 0, currency: "MAD" },
    hero: {},
    stats: [],
    trust: [],
    oils: [],
    benefits: [],
    video: {},
    cases: [],
    about: {},
    products: [],
    testimonials: [],
    faq: [],
    orderSteps: [],
    legal: {},
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Overlays `patch` onto `base` (shallow) — keeps base keys the patch lacks. */
function mergeBlock<T extends object>(base: T, patch: unknown): T {
  const rec = asRecord(patch);
  if (!rec) return base;
  return { ...(base as object), ...rec } as T;
}

async function fetchTable(db: Db, table: string, orderColumn?: string): Promise<Record<string, unknown>[]> {
  try {
    let q = db.from(table).select("*");
    if (orderColumn) q = q.order(orderColumn, { ascending: true });
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Record<string, unknown>[];
  } catch (err) {
    console.warn(`[public-content] table "${table}" unavailable, using fallback:`, err);
    return [];
  }
}

async function fetchContentBlocks(db: Db): Promise<Record<string, unknown>> {
  try {
    const { data, error } = await db.from("homepage_content").select("key, content");
    if (error) throw error;
    const blocks: Record<string, unknown> = {};
    for (const row of data ?? []) blocks[(row as { key: string }).key] = (row as { content: unknown }).content;
    return blocks;
  } catch (err) {
    console.warn("[public-content] homepage_content unavailable, using fallback:", err);
    return {};
  }
}

/**
 * Loads the public landing configuration:
 * Default config overlaid with dashboard-managed database content.
 * All data comes from Supabase — no config.json dependency.
 */
export async function loadPublicConfig(): Promise<SodfaConfig> {
  // Start with empty default config
  const base = getDefaultConfig();

  try {
    const db = createClient();

    // homepage_sections needs public read — RLS may block anon in incognito,
    // so fallback to public API (admin bypass) when anon returns empty.
    async function fetchSections(): Promise<Record<string, unknown>[]> {
      const anon = await fetchTable(db, "homepage_sections", "order");
      if (anon.length > 0) return anon;
      // Try public API (uses admin client, bypasses RLS)
      try {
        // On server, call admin directly to avoid fetch loop
        if (typeof window === "undefined") {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const admin = createAdminClient();
          const { data, error } = await admin.from("homepage_sections").select("*").order("order", { ascending: true });
          if (!error && data && data.length > 0) return data as Record<string, unknown>[];
        } else {
          const res = await fetch("/api/homepage-sections", { cache: "no-store" });
          const json = await res.json().catch(() => null);
          if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data as Record<string, unknown>[];
          }
        }
      } catch {}
      return anon;
    }

    const [sections, blocks, testimonials, faqs, benefits, oils, stats, trustBadges, pageFeatures, floatingButtons] =
      await Promise.all([
        fetchSections(),
        fetchContentBlocks(db),
        fetchTable(db, "testimonials", "sort_order"),
        fetchTable(db, "faqs", "sort_order"),
        fetchTable(db, "benefits", "sort_order"),
        fetchTable(db, "oils", "sort_order"),
        fetchTable(db, "stats", "sort_order"),
        fetchTable(db, "trust_badges", "sort_order"),
        fetchTable(db, "page_features", "sort_order"),
        fetchTable(db, "floating_buttons", "sort_order"),
      ]);

    // --- Sections on/off + order ---
    if (sections.length > 0) {
      base.sections = sections.map(
        (s): SectionConfig => ({
          id: String(s.id),
          file: String(s.id),
          enabled: s.status === "active",
        })
      );
    }

    // --- Singleton content blocks ---
    if (blocks["site_info"]) base.site = mergeBlock<SiteConfig>(base.site, blocks["site_info"]);
    if (blocks["hero"]) base.hero = mergeBlock<HeroConfig>(base.hero, blocks["hero"]);
    if (blocks["pricing"]) base.pricing = mergeBlock<PricingConfig>(base.pricing, blocks["pricing"]);
    if (blocks["about"]) {
      const aboutPatch = asRecord(blocks["about"]);
      if (aboutPatch) {
        const { founderName, founderLogo, ...aboutFields } = aboutPatch;
        base.about = mergeBlock<AboutConfig>(base.about, aboutFields);
        base.founder = {
          ...base.founder,
          name: typeof founderName === "string" ? founderName : base.founder?.name,
          logo: typeof founderLogo === "string" ? founderLogo : base.founder?.logo,
        };
      }
    }
    if (blocks["video"]) base.video = mergeBlock<VideoConfig>(base.video, blocks["video"]);
    if (blocks["legal"]) base.legal = mergeBlock<LegalConfig>(base.legal, blocks["legal"]);
    if (blocks["seo"]) base.seo = mergeBlock<Record<string, string>>(base.seo ?? {}, blocks["seo"]);

    const orderStepsBlock = asRecord(blocks["order_steps"]);
    if (orderStepsBlock && Array.isArray(orderStepsBlock.steps) && orderStepsBlock.steps.length > 0) {
      base.orderSteps = (orderStepsBlock.steps as Record<string, unknown>[]).map(
        (s): OrderStep => ({
          num: String(s.num ?? ""),
          title: String(s.title ?? ""),
          desc: String(s.desc ?? ""),
          mini: s.mini ? String(s.mini) : undefined,
        })
      );
    }

    // --- Collections ---
    const approvedTestimonials = testimonials.filter((t) => t.is_approved === true);
    if (approvedTestimonials.length > 0) {
      base.testimonials = approvedTestimonials.map(
        (t): TestimonialItem => ({
          name: String(t.name ?? ""),
          city: t.city ? String(t.city) : undefined,
          initial: t.initials ? String(t.initials) : undefined,
          rating: Number(t.rating ?? 5),
          text: String(t.comment ?? ""),
        })
      );
    }

    if (faqs.length > 0) {
      base.faq = faqs.map((f): FaqItem => ({ q: String(f.question ?? ""), a: String(f.answer ?? "") }));
    }

    if (benefits.length > 0) {
      base.benefits = benefits.map(
        (b): BenefitItem => ({
          icon: String(b.icon ?? "shield"),
          title: String(b.title ?? ""),
          desc: String(b.description ?? ""),
          span: Number(b.col_span ?? 2),
        })
      );
    }

    if (oils.length > 0) {
      base.oils = oils.map(
        (o): OilItem => ({
          num: String(o.display_num ?? ""),
          img: String(o.image_url ?? ""),
          name: String(o.name ?? ""),
          latin: String(o.latin_name ?? ""),
          points: Array.isArray(o.points) ? (o.points as unknown[]).map(String) : [],
          tag: String(o.tag ?? ""),
        })
      );
    }

    if (stats.length > 0) {
      base.stats = stats.map(
        (s): StatItem => ({
          count: Number(s.count_value ?? 0),
          pre: s.prefix ? String(s.prefix) : undefined,
          suf: s.suffix ? String(s.suffix) : undefined,
          label: String(s.label ?? ""),
        })
      );
    }

    if (trustBadges.length > 0) {
      base.trust = trustBadges.map(
        (t): TrustItem => ({
          icon: String(t.icon ?? "shield"),
          title: String(t.title ?? ""),
          desc: String(t.description ?? ""),
        })
      );
    }

    // --- Page features & floating buttons ---
    if (pageFeatures.length > 0) {
      base.pageSettings = pageFeatures.map((p) => ({
        id: String(p.feature_key),
        name: String(p.name ?? ""),
        enabled: p.is_enabled === true,
      }));
    }

    if (floatingButtons.length > 0) {
      base.buttonsSettings = floatingButtons.map((b) => ({
        id: String(b.button_key),
        name: String(b.name ?? ""),
        position: String(b.position ?? "right"),
        enabled: b.is_enabled === true,
      }));
    }
  } catch (err) {
    console.warn("[public-content] database overlay skipped:", err);
  }

  return base;
}
