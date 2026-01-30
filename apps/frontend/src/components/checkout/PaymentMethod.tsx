'use client';

/**
 * Payment Method Component
 * Allows users to select payment method including saved cards and digital wallets
 * Requirements: 11.3, 11.4 - Payment method selection
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
}

interface PaymentMethodProps {
  selectedMethodId: string | null;
  onSelect: (methodId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentMethod({
  selectedMethodId,
  onSelect,
  onNext,
  onBack,
}: PaymentMethodProps) {
  const { t, language } = useTranslation('checkout');
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    saveCard: false,
  });

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const fetchSavedCards = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // For now, we'll use mock data
      const mockCards: SavedCard[] = [];
      setSavedCards(mockCards);
    } catch (error) {
      console.error('Failed to fetch saved cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substr(0, 5);
    }

    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substr(0, 4);
    }

    setCardForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue,
    }));
  };

  const handleAddCard = () => {
    // In a real implementation, this would validate and save the card
    const newCardId = 'new-card';
    onSelect(newCardId);
    setShowAddCard(false);
  };

  const paymentOptions = [
    {
      id: 'mada',
      name: 'Mada',
      nameAr: 'مدى',
      icon: '💳',
      available: true,
    },
    {
      id: 'visa',
      name: 'Visa / Mastercard',
      nameAr: 'فيزا / ماستركارد',
      icon: '💳',
      available: true,
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      nameAr: 'آبل باي',
      icon: '',
      available: true,
    },
    {
      id: 'stc-pay',
      name: 'STC Pay',
      nameAr: 'إس تي سي باي',
      icon: '📱',
      available: true,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('selectPayment', 'Select Payment Method')}
        </h2>

        {/* Saved Cards */}
        {savedCards.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {t('savedCards', 'Saved Cards')}
            </h3>
            <div className="space-y-2">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedMethodId === card.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onSelect(card.id)}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <input
                      type="radio"
                      checked={selectedMethodId === card.id}
                      onChange={() => onSelect(card.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium uppercase">{card.brand}</span>
                        <span className="text-gray-600">•••• {card.last4}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {t('expires', 'Expires')} {card.expiryMonth}/{card.expiryYear}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Options */}
        <div className="space-y-3">
          {paymentOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedMethodId === option.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!option.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => option.available && onSelect(option.id)}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="radio"
                  checked={selectedMethodId === option.id}
                  onChange={() => onSelect(option.id)}
                  disabled={!option.available}
                />
                <span className="text-2xl">{option.icon}</span>
                <span className="font-medium">
                  {language === 'ar' ? option.nameAr : option.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Card Button */}
        {!showAddCard && (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            + {t('addNewCard', 'Add New Card')}
          </button>
        )}

        {/* Add Card Form */}
        {showAddCard && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-4">{t('addNewCard', 'Add New Card')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cardNumber', 'Card Number')}
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardForm.cardNumber}
                  onChange={handleCardFormChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('expiryDate', 'Expiry Date')}
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardForm.expiryDate}
                    onChange={handleCardFormChange}
                    placeholder="MM/YY"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cvv', 'CVV')}
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardForm.cvv}
                    onChange={handleCardFormChange}
                    placeholder="123"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cardholderName', 'Cardholder Name')}
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={cardForm.cardholderName}
                  onChange={handleCardFormChange}
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="saveCard"
                  checked={cardForm.saveCard}
                  onChange={handleCardFormChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ms-2 text-sm text-gray-700">
                  {t('saveCard', 'Save card for future use')}
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddCard}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('save', 'Save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          {t('back', 'Back')}
        </button>
        <button
          onClick={onNext}
          disabled={!selectedMethodId}
          className={`flex-1 px-8 py-3 rounded-lg font-medium ${
            selectedMethodId
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t('continue', 'Continue')}
        </button>
      </div>
    </div>
  );
}
