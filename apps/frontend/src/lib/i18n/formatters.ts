/**
 * Format price in SAR currency with locale-aware formatting
 */
export function formatPrice(amount: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date with locale-aware formatting
 */
export function formatDate(date: Date, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date and time with locale-aware formatting
 */
export function formatDateTime(date: Date, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format number with locale-aware formatting
 */
export function formatNumber(num: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA').format(num);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date, locale: string = 'en'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    numeric: 'auto',
  });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}
