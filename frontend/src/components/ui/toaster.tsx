'use client';

import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isDestructive = t.variant === 'destructive';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              isDestructive
                ? 'bg-destructive/15 border-destructive/30 text-destructive'
                : 'bg-card/95 border-border text-foreground'
            }`}
          >
            {isDestructive ? (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            )}

            <div className="flex-1 space-y-1">
              {t.title && <p className="font-semibold text-sm leading-none">{t.title}</p>}
              {t.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground transition p-0.5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
