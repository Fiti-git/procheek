"use client";

import Image from "next/image";
import { useState } from "react";

type CommonProps = {
  src?: string | null;
  code: string;
  alt: string;
  className?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  unoptimized?: boolean;
  style?: React.CSSProperties;
};

type FillProps = CommonProps & {
  fill: true;
  width?: never;
  height?: never;
};

type FixedProps = CommonProps & {
  fill?: false;
  width: number;
  height: number;
};

export type CourseImageProps = FillProps | FixedProps;

/**
 * Branded course image with graceful fallback. When the underlying `src`
 * is missing or fails to load, renders a solid brand-navy panel with the
 * course code in bold gold and a small "PROCHECK" wordmark below.
 *
 * Wraps `next/image` for real thumbnails so we keep the same aspect ratio
 * and layout behavior as the original image slot.
 */
export function CourseImage(props: CourseImageProps) {
  const {
    src,
    code,
    alt,
    className,
    sizes,
    quality,
    priority,
    unoptimized,
    style,
  } = props;
  const [broken, setBroken] = useState(false);

  const showFallback = !src || broken;

  if (showFallback) {
    // Fallback fills the same slot. Uses absolute positioning when `fill` is
    // set so it stretches to the parent (which must be `position: relative`),
    // otherwise sizes itself via the explicit width/height.
    const fillMode = "fill" in props && props.fill;
    const wrapperStyle: React.CSSProperties = fillMode
      ? { position: "absolute", inset: 0, ...style }
      : {
          width: (props as FixedProps).width,
          height: (props as FixedProps).height,
          ...style,
        };

    return (
      <div
        role="img"
        aria-label={alt}
        className={className}
        style={{
          ...wrapperStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F1E3D",
          color: "#FBB601",
          textAlign: "center",
          padding: "8%",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontWeight: 700,
            color: "#FBB601",
            fontSize: "clamp(14px, 6cqw, 34px)",
            letterSpacing: "0.02em",
            lineHeight: 1.1,
            wordBreak: "break-word",
          }}
        >
          {code}
        </span>
        <span
          style={{
            marginTop: "0.5em",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            fontSize: "clamp(8px, 2.4cqw, 12px)",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          PROCHECK
        </span>
      </div>
    );
  }

  // Real image path.
  const onError = () => setBroken(true);

  if ("fill" in props && props.fill) {
    return (
      <Image
        src={src as string}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        quality={quality}
        priority={priority}
        unoptimized={unoptimized}
        style={style}
        onError={onError}
      />
    );
  }

  const { width, height } = props as FixedProps;
  return (
    <Image
      src={src as string}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      quality={quality}
      priority={priority}
      unoptimized={unoptimized}
      style={style}
      onError={onError}
    />
  );
}

export default CourseImage;
