"use client";

import Link from "next/link";
import { Play, Check } from "lucide-react";
import type { Course } from "@/lib/courses";
import { imageForCourse } from "@/lib/images";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";

export function CourseCard({ course }: { course: Course }) {
  const src = imageForCourse(course.code);
  const { items, add, hydrated } = useCart();
  const { toast } = useToast();
  const inCart = hydrated && items.some((i) => i.courseId === course.id);

  const onAdd = () => {
    add({
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      price: course.price,
      image: src,
    });
    toast({
      title: "Añadido al carrito",
      description: course.title,
      variant: "success",
    });
  };

  return (
    <article data-testid="course-card" className="card-enterprise group flex flex-col overflow-hidden">
      <Link
        href={`/courses/${course.code}`}
        className="relative aspect-video overflow-hidden bg-ink-100 photo-duotone-subtle block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={course.title}
          className="transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center bg-ink-50 text-ink-900 border border-line rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide uppercase">
            {course.code}
          </span>
        </div>
        {/* Play button overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="h-12 w-12 rounded-full bg-white/90 border border-white shadow-cardHover flex items-center justify-center">
            <Play className="h-5 w-5 text-coral-600 fill-coral-600 ml-0.5" />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="field-mono mb-2">
          {course.code} · STPS · {course.hours} h
        </div>
        <Link
          href={`/courses/${course.code}`}
          className="font-display text-lg font-semibold text-ink-900 leading-snug tracking-tight line-clamp-2 mb-2 hover:text-coral-600 transition-colors"
        >
          <h3 className="inline">{course.title}</h3>
        </Link>
        {course.description && (
          <p className="text-sm text-ink-500 mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Preview strip: 3 module thumbnails */}
        <div className="flex items-center gap-1.5 mt-1 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-md overflow-hidden border border-line bg-coral-50 relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                style={{ filter: `hue-rotate(${i * 12}deg) saturate(0.9)` }}
              />
            </div>
          ))}
          <span className="ml-1 text-[11px] font-medium text-ink-500">
            3 módulos
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-3">
            <span className="font-display text-2xl font-semibold text-ink-900 tracking-tight">
              ${course.price.toLocaleString("es-MX")}
            </span>
            <span className="text-sm text-ink-500 ml-1">MXN + IVA</span>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className={
              inCart
                ? "btn-secondary w-full inline-flex items-center justify-center gap-2"
                : "btn-primary w-full"
            }
          >
            {inCart ? (
              <>
                <Check className="h-4 w-4" />
                En el carrito
              </>
            ) : (
              "Añadir al carrito"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
