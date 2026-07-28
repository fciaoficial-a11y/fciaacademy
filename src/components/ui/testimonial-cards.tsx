"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export type TestimonialCardPosition = "front" | "middle" | "back";

type TestimonialCardProps = {
  handleShuffle: () => void;
  testimonial: string;
  position: TestimonialCardPosition;
  author: string;
  role?: string;
  initials: string;
  photoUrl?: string;
};

export function TestimonialCard({
  handleShuffle,
  testimonial,
  position,
  author,
  role,
  initials,
  photoUrl,
}: TestimonialCardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";

  return (
    <motion.div
      style={{ zIndex: position === "front" ? 3 : position === "middle" ? 2 : 1 }}
      animate={{
        rotate: position === "front" ? "-6deg" : position === "middle" ? "0deg" : "6deg",
        x: position === "front" ? "0%" : position === "middle" ? "12%" : "24%",
        y: position === "front" ? "0%" : position === "middle" ? "-4%" : "-8%",
      }}
      drag
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDragStart={(e) => {
        dragRef.current = "clientX" in e ? (e as PointerEvent).clientX : 0;
      }}
      onDragEnd={(e) => {
        const endX = "clientX" in e ? (e as PointerEvent).clientX : 0;
        if (dragRef.current - endX > 120) handleShuffle();
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 flex h-[420px] w-[300px] select-none flex-col justify-between rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur-md sm:h-[440px] sm:w-[340px] ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-primary" aria-label="5 estrelas">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        {isFront && (
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            arraste
          </span>
        )}
      </div>

      <blockquote className="text-center text-base italic leading-relaxed text-foreground/90 sm:text-lg">
        “{testimonial}”
      </blockquote>

      <div className="flex items-center justify-center gap-3 border-t border-border/60 pt-4">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={author}
            className="pointer-events-none h-12 w-12 rounded-full object-cover ring-2 ring-primary/30"
          />
        ) : (
          <div
            aria-hidden
            className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-2 ring-primary/30"
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 text-left">
          <div className="truncate text-sm font-semibold text-foreground">{author}</div>
          {role && <div className="truncate text-xs text-muted-foreground">{role}</div>}
        </div>
      </div>
    </motion.div>
  );
}

export type ShuffleTestimonial = {
  quote: string;
  name: string;
  role?: string;
  initials: string;
  photoUrl?: string;
};

export function ShuffleCards({ items }: { items: ShuffleTestimonial[] }) {
  const base = items.slice(0, 3);
  const [positions, setPositions] = React.useState<TestimonialCardPosition[]>([
    "front",
    "middle",
    "back",
  ]);

  const handleShuffle = () => {
    setPositions((prev) => {
      const next = [...prev];
      next.unshift(next.pop()!);
      return next;
    });
  };

  if (base.length === 0) return null;

  return (
    <div className="grid place-content-center">
      <div className="relative h-[440px] w-[300px] sm:h-[460px] sm:w-[420px]">
        {base.map((t, i) => (
          <TestimonialCard
            key={t.name + i}
            handleShuffle={handleShuffle}
            position={positions[i] ?? "back"}
            testimonial={t.quote}
            author={t.name}
            role={t.role}
            initials={t.initials}
            photoUrl={t.photoUrl}
          />
        ))}
      </div>
    </div>
  );
}
