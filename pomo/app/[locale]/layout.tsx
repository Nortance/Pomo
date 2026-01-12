import type { Metadata } from 'next';
import i18nConfig from '@/i18nConfig';
import { getTranslations } from '@/lib/translations';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations(locale);

  const baseUrl = 'https://codefocus.io';

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: locale === 'en' ? baseUrl : `${baseUrl}/${locale}`,
      languages: {
        'en': baseUrl,
        'es': `${baseUrl}/es`,
        'de': `${baseUrl}/de`,
        'fr': `${baseUrl}/fr`,
        'pt': `${baseUrl}/pt`,
        'x-default': baseUrl
      }
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      locale: locale,
    }
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <div lang={locale}>
      {children}
    </div>
  );
}
