"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/context";
import type { Participant } from "@/lib/api";

interface WishlistCardProps {
  participant: Participant | null;
  wishlistValue: string;
  setWishlistValue: (value: string) => void;
  isWishlistLocked: boolean;
  isSaving: boolean;
  wishlistError: string | null;
  onSave: (formEvent: React.FormEvent) => void;
  className?: string;
}

export function WishlistCard({
  participant,
  wishlistValue,
  setWishlistValue,
  isWishlistLocked,
  isSaving,
  wishlistError,
  onSave,
  className,
}: WishlistCardProps) {
  const { currentUser } = useApp();
  const [isExpanded, setIsExpanded] = useState(!isWishlistLocked);

  useEffect(() => {
    if (!isWishlistLocked) {
      setIsExpanded(true);
    }
  }, [isWishlistLocked]);

  const shouldShowContent = !isWishlistLocked || isExpanded;

  return (
    <div className={`relative ${className}`}>
      {/* Scroll container with parchment effect */}
      <div className="relative">
        {/* Main scroll/letter */}
        <div 
          className="relative bg-gradient-to-b from-amber-50 via-amber-50/95 to-amber-50/90 rounded-lg shadow-sm border-2 border-amber-200/50 overflow-hidden"
        >
          
          {/* Letter content */}
          <div className="p-8 md:p-12 relative z-0">
            {/* Letter header */}
            <div className="text-center">
              <div className="inline-block px-4 py-2 bg-amber-100 rounded-full border-2 border-amber-300/50 mt-2">
                <p className="text-xs text-amber-800/70 font-medium tracking-wider ">✉️ Мое письмо Деду Морозу</p>
              </div>
            </div>

            {/* Expandable content */}
            <div
              className={`grid transition-all duration-700 ease-out ${
                shouldShowContent ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="animate-slide-up-fade-in">
                  <h2 className="text-2xl md:text-3xl font-serif text-amber-900/90 my-6 text-center" style={{ fontFamily: 'Georgia, serif' }}>
                    Дорогой Дедушка Мороз! 🎅
                  </h2>
                {participant ? (
                  <form className="space-y-6" onSubmit={onSave}>
                    {/* Letter body */}
                    <div className="space-y-4">
                      <p className="text-amber-900/80 font-serif text-base md:text-lg leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                        Я очень старался быть хорошим в этом году! Пожалуйста, посмотри мой список желаний:
                        {!isWishlistLocked && " Пожалуйста, посмотри мой список желаний:"}
                      </p>
                      
                      {isWishlistLocked && wishlistValue && (
                        <p className="text-amber-900/90 font-serif text-base leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
                          {wishlistValue}
                        </p>
                      )}
                      
                      {!isWishlistLocked && (
                        <div className="relative">
                          <Textarea
                            value={wishlistValue}
                            onChange={(e) => setWishlistValue(e.target.value)}
                            placeholder="Напиши здесь свои желания... Например, книга, сладости или сертификат в любимый магазин... ✨"
                            rows={8}
                            disabled={isSaving || isWishlistLocked}
                            className="bg-amber-50/30 border-amber-200/50 text-amber-900 placeholder:text-amber-600/50 font-serif text-base leading-relaxed resize-none focus:ring-amber-300/50 focus:border-amber-300"
                            style={{ fontFamily: 'Georgia, serif' }}
                          />
                        </div>
                      )}
                    </div>

                    {wishlistError && (
                      <p className="error-message text-sm text-red-600 bg-red-50/50 p-2 rounded border border-red-200/50">
                        {wishlistError}
                      </p>
                    )}

                    {!isWishlistLocked && (
                      <div className="pt-4 border-t border-amber-200/30">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? "Отправляю письмо..." : "Отправить письмо ✉️"}
                        </button>
                      </div>
                    )}

                    {isWishlistLocked && (
                      <div className="p-4 border border-amber-200/50 rounded-lg">
                        <p className="text-center text-amber-700/70 text-sm font-serif italic">
                          Письмо уже отправлено! 🎅
                        </p>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-amber-900/70 font-serif text-base" style={{ fontFamily: 'Georgia, serif' }}>
                      Ты пока не участвуешь в этом событии. Попроси администратора добавить тебя — и чудо произойдет! ✨
                    </p>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Letter footer */}
            {shouldShowContent && participant && currentUser && (
              <div className="mt-8 pt-6 border-t border-amber-200/30 text-right">
                <p className="text-amber-900/70 font-serif text-sm italic" style={{ fontFamily: 'Georgia, serif' }}>
                  С любовью,<br />
                  <span className="text-amber-900/90 font-semibold">{currentUser.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapse button (only when locked) */}
      {isWishlistLocked && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300/50 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
        >
          <ChevronDown
            className={`h-5 w-5 text-amber-800 transition-transform duration-300 ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </button>
      )}
    </div>
  );
}
