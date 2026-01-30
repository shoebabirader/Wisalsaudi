'use client';

/**
 * Address Form Component
 * Form for adding or editing addresses
 * Requirements: 11.1 - Address management for checkout
 */

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface AddressFormProps {
  address?: Address | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const { t } = useTranslation('checkout');
  const [formData, setFormData] = useState({
    type: address?.type || 'home',
    street: address?.street || '',
    city: address?.city || '',
    province: address?.province || '',
    postal_code: address?.postal_code || '',
    country: address?.country || 'Saudi Arabia',
    is_default: address?.is_default || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = address ? `/api/addresses/${address.id}` : '/api/addresses';
      const method = address ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error?.message || 'Failed to save address');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('addressType', 'Address Type')}
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="home">{t('home', 'Home')}</option>
          <option value="work">{t('work', 'Work')}</option>
          <option value="other">{t('other', 'Other')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('street', 'Street Address')} *
        </label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('streetPlaceholder', 'Enter street address')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('city', 'City')} *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('cityPlaceholder', 'Enter city')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('province', 'Province')} *
          </label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('provincePlaceholder', 'Enter province')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('postalCode', 'Postal Code')}
          </label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('postalCodePlaceholder', 'Enter postal code')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('country', 'Country')} *
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_default"
          checked={formData.is_default}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ms-2 text-sm text-gray-700">
          {t('setAsDefault', 'Set as default address')}
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          {t('cancel', 'Cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? t('saving', 'Saving...') : t('save', 'Save Address')}
        </button>
      </div>
    </form>
  );
}
