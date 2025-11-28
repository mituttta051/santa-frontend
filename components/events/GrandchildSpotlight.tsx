import { createElement, useEffect } from "react";
import type { HTMLAttributes } from "react";
import { Sparkles } from "lucide-react";

interface GrandchildSpotlightProps {
  name: string;
  subtitle?: string;
}

type SpoilerSpanProps = HTMLAttributes<HTMLElement> & {
  density?: number | string;
  "reveal-duration"?: number | string;
  "particle-lifetime"?: number | string;
};

let spoilerJsPromise: Promise<unknown> | null = null;

function ensureSpoilerJsLoaded() {
  if (!spoilerJsPromise) {
    spoilerJsPromise = import("spoilerjs/spoiler-span").catch((error) => {
      spoilerJsPromise = null;
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to load spoilerjs component", error);
      }
    });
  }
}

function useSpoilerJs() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    ensureSpoilerJsLoaded();
  }, []);
}

export function GrandchildSpotlight({ name, subtitle }: GrandchildSpotlightProps) {
  useSpoilerJs();

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-blue-700 to-indigo-800 px-6 pb-8 pt-12 text-center text-white shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_65%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-slate-900/20" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        {createElement(
          "spoiler-span",
          {
            className:
              "relative flex h-36 w-36 cursor-pointer items-center justify-center rounded-full border-[6px] border-white/80 bg-gradient-to-br from-white via-sky-50 to-blue-100 text-sky-600 shadow-[0_15px_35px_rgba(15,23,42,0.35)] transition-shadow hover:shadow-[0_20px_45px_rgba(15,23,42,0.45)]",
            density: "12",
            "reveal-duration": "500",
            "aria-label": "Показать фото внучка",
          } satisfies SpoilerSpanProps,
          <>
            <Sparkles className="relative z-10 h-16 w-16" />
          </>
        )}
        {createElement(
          "spoiler-span",
          {
            className:
              "w-full cursor-pointer rounded-2xl bg-white/95 px-6 py-3 text-xl font-semibold text-slate-800 shadow-lg backdrop-blur transition-all hover:bg-white",
            density: "8",
            "reveal-duration": "500",
            "aria-label": "Показать имя внучка",
          } satisfies SpoilerSpanProps,
          name
        )}
        <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-slate-100 shadow-inner">
          {subtitle ??
            "Самый дорогой внучок сезона: следи за его мечтами и готовься к чуду."}
        </div>
      </div>
    </div>
  );
}

