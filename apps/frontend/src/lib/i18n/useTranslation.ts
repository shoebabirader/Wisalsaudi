import { useLanguage } from './LanguageProvider';
import enCommon from '../../../public/locales/en/common.json';
import arCommon from '../../../public/locales/ar/common.json';
import enHome from '../../../public/locales/en/home.json';
import arHome from '../../../public/locales/ar/home.json';
import enCart from '../../../public/locales/en/cart.json';
import arCart from '../../../public/locales/ar/cart.json';
import enProfile from '../../../public/locales/en/profile.json';
import arProfile from '../../../public/locales/ar/profile.json';
import enProducts from '../../../public/locales/en/products.json';
import arProducts from '../../../public/locales/ar/products.json';
import enCheckout from '../../../public/locales/en/checkout.json';
import arCheckout from '../../../public/locales/ar/checkout.json';

const translations = {
  en: {
    common: enCommon,
    home: enHome,
    cart: enCart,
    profile: enProfile,
    products: enProducts,
    checkout: enCheckout,
  },
  ar: {
    common: arCommon,
    home: arHome,
    cart: arCart,
    profile: arProfile,
    products: arProducts,
    checkout: arCheckout,
  },
};

type TranslationNamespace = 'common' | 'home' | 'cart' | 'profile' | 'products' | 'checkout';

export function useTranslation(namespace: TranslationNamespace = 'common') {
  const { language } = useLanguage();

  const t = (key: string, paramsOrFallback?: Record<string, string | number> | string): string => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[language][namespace];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // If translation not found and fallback string provided, return it
        if (typeof paramsOrFallback === 'string') {
          return paramsOrFallback;
        }
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      // If translation not found and fallback string provided, return it
      if (typeof paramsOrFallback === 'string') {
        return paramsOrFallback;
      }
      return key;
    }

    // Replace parameters in the translation (only if params is an object)
    if (paramsOrFallback && typeof paramsOrFallback === 'object') {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return paramsOrFallback[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  return { t, language };
}
