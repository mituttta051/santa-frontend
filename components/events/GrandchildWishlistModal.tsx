import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface GrandchildWishlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wishlist?: string;
  childName?: string;
}

export function GrandchildWishlistModal({
  open,
  onOpenChange,
  wishlist,
  childName,
}: GrandchildWishlistModalProps) {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalElement(document.body);
  }, []);

  if (!portalElement || !open) {
    return null;
  }

  const handleClose = () => onOpenChange(false);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 px-4 py-8 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        
        {/* Main scroll/letter */}
        <div 
          className="relative bg-gradient-to-b from-amber-50 via-amber-50 to-amber-50 rounded-lg shadow-2xl border-2 border-amber-200/50 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-300/50 text-amber-800 transition-all duration-200 hover:scale-110 shadow-md"
            aria-label="Закрыть письмо"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
          
          {/* Letter content */}
          <div className="p-8 md:p-12 relative z-0">
            {/* Letter header */}
            <div className="mb-6 text-center">
            <div className="inline-block px-4 py-2 bg-amber-100 rounded-full border-2 border-amber-300/50 mt-2">
                <p className="text-xs text-amber-800/70 font-medium tracking-wider ">✉️ Письмо Деду Морозу</p>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-amber-900/90 my-2" style={{ fontFamily: 'Georgia, serif' }}>
                Дорогой Дедушка Мороз! 🎅
              </h2>
            </div>

            {/* Letter body */}
            <div className="space-y-4">
              <p className="text-amber-900/80 font-serif text-base md:text-lg leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                Я очень старался быть хорошим в этом году! Пожалуйста, посмотри мой список желаний:
              </p>
              
              <p className="text-amber-900/90 font-serif text-base md:text-lg leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
                {wishlist?.trim() ? wishlist : "Вишлист пока пуст — спроси внучка о его мечтах и вернись позже."}
              </p>
            </div>

            {/* Letter footer */}
            {childName && (
              <div className="mt-8 pt-6 border-t border-amber-200/30 text-right">
                <p className="text-amber-900/70 font-serif text-sm italic" style={{ fontFamily: 'Georgia, serif' }}>
                  С любовью,<br />
                  <span className="text-amber-900/90 font-semibold">{childName}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    portalElement
  );
}

