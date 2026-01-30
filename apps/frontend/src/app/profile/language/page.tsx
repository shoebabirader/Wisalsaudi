'use client';

import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft,
  CheckCircle,
  Languages
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Language = 'en' | 'ar';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export default function LanguageSelectionPage() {
  const { t, language } = useTranslation('profile');
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language as Language);
  const [isSaving, setIsSaving] = useState(false);

  const languages: LanguageOption[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr'
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'rtl'
    }
  ];

  const handleLanguageSelect = (langCode: Language) => {
    setSelectedLanguage(langCode);
  };

  const handleSave = async () => {
    if (selectedLanguage === language) {
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Change language in the app
      // await changeLanguage(selectedLanguage);

      // TODO: Save preference to backend if user is logged in
      // await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ language: selectedLanguage })
      // });

      // Update HTML dir attribute
      document.documentElement.dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = selectedLanguage;

      // Store in localStorage
      localStorage.setItem('language', selectedLanguage);

      // Navigate back after a short delay to show the change
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('Failed to change language:', error);
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{t('language.title')}</h1>
        </div>
      </div>

      {/* Language Options */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                selectedLanguage === lang.code ? 'bg-primary/5' : ''
              }`}
            >
              {/* Language Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedLanguage === lang.code
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Languages className="w-6 h-6" />
              </div>

              {/* Language Info */}
              <div className="flex-1 text-start">
                <h3 className="font-semibold text-gray-900">
                  {lang.nativeName}
                </h3>
                <p className="text-sm text-gray-600">
                  {lang.name}
                </p>
              </div>

              {/* Selected Indicator */}
              {selectedLanguage === lang.code && (
                <CheckCircle className="w-6 h-6 text-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {language === 'ar' 
              ? 'سيتم تطبيق اللغة المحددة على جميع أجزاء التطبيق وسيتم حفظها لزياراتك القادمة.'
              : 'The selected language will be applied to all parts of the app and saved for your future visits.'
            }
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSaving 
            ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
            : (language === 'ar' ? 'حفظ' : 'Save')
          }
        </button>

        {/* Preview of Changes */}
        {selectedLanguage !== language && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              {language === 'ar' ? 'معاينة التغييرات:' : 'Preview of changes:'}
            </p>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>
                • {language === 'ar' 
                  ? `اتجاه النص: ${selectedLanguage === 'ar' ? 'من اليمين إلى اليسار' : 'من اليسار إلى اليمين'}`
                  : `Text direction: ${selectedLanguage === 'ar' ? 'Right-to-Left' : 'Left-to-Right'}`
                }
              </li>
              <li>
                • {language === 'ar'
                  ? 'سيتم ترجمة جميع النصوص'
                  : 'All text will be translated'
                }
              </li>
              <li>
                • {language === 'ar'
                  ? 'سيتم تحديث تنسيق التاريخ والأرقام'
                  : 'Date and number formatting will be updated'
                }
              </li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
