"use client";

import styles from "./ProductCard.module.css";

type ProductCardSkeletonProps = {
  compact?: boolean;
};

export function ProductCardSkeleton({ compact = false }: ProductCardSkeletonProps) {
  const rootClass = [styles.skeleton, compact ? styles.skeletonCompact : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      {/* Image placeholder */}
      <div className={styles.skeletonImage}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.4) 50%, transparent 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.8s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content placeholder */}
      <div className={styles.content}>
        <div>
          <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonBrand}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`} />
        </div>
      </div>
    </div>
  );
}
