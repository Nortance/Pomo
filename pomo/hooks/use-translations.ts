'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

type TranslationMessages = Record<string, string>;

export function useTranslations() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [messages, setMessages] = useState<TranslationMessages>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    import(`@/messages/${locale}.json`)
      .then((mod) => {
        setMessages(mod.default);
        setIsLoading(false);
      })
      .catch(() => {
        // Fallback to English
        import('@/messages/en.json')
          .then((mod) => {
            setMessages(mod.default);
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      });
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = messages[key] || key;

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }

      return text;
    },
    [messages]
  );

  return { t, locale, isLoading };
}
