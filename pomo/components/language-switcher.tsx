'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { US, ES, DE, FR, BR, JP, CN } from 'country-flag-icons/react/3x2';
import { track } from '@/lib/analytics';
import { MixpanelEvents } from '@/lib/mixpanel-events';

const locales = [
  { code: 'en', label: 'English', Flag: US },
  { code: 'es', label: 'Español', Flag: ES },
  { code: 'de', label: 'Deutsch', Flag: DE },
  { code: 'fr', label: 'Français', Flag: FR },
  { code: 'pt', label: 'Português', Flag: BR },
  { code: 'ja', label: '日本語', Flag: JP },
  { code: 'zh', label: '中文', Flag: CN },
];

export function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = (params?.locale as string) || 'en';
  const currentLocaleData = locales.find(l => l.code === currentLocale) || locales[0];
  const CurrentFlag = currentLocaleData.Flag;

  const handleChange = (newLocale: string) => {
    const newLocaleData = locales.find(l => l.code === newLocale);
    track(MixpanelEvents.LANGUAGE_CHANGED, {
      from_locale: currentLocale,
      to_locale: newLocale,
      to_label: newLocaleData?.label,
    });

    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1.5">
          <CurrentFlag className="h-4 w-5 rounded-md overflow-hidden" title={currentLocaleData.label} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(({ code, label, Flag }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleChange(code)}
            className="text-xs gap-2"
          >
            {code === currentLocale && <Check className="h-3 w-3" />}
            {code !== currentLocale && <span className="w-3" />}
            <Flag className="h-3 w-4 rounded-md overflow-hidden" title={label} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
