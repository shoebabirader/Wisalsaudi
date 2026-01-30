'use client';

/**
 * Address Selection Component
 * Allows users to select or add delivery addresses
 * Requirements: 11.1 - Address management for checkout
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import AddressForm from './AddressForm';

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

interface AddressSelectionProps {
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
  onNext: () => void;
}

export default function AddressSelection({
  selectedAddressId,
  onSelect,
  onNext,
}: AddressSelectionProps) {
  const { t } = useTranslation('checkout');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/addresses', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.data);

        // Auto-select default address
        const defaultAddress = data.data.find((addr: Address) => addr.is_default);
        if (defaultAddress && !selectedAddressId) {
          onSelect(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm(t('confirmDelete', 'Are you sure you want to delete this address?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchAddresses();
        if (selectedAddressId === addressId) {
          onSelect('');
        }
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

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

  if (showAddForm) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingAddress
            ? t('editAddress', 'Edit Address')
            : t('addNewAddress', 'Add New Address')}
        </h2>
        <AddressForm
          address={editingAddress}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {t('selectAddress', 'Select Delivery Address')}
          </h2>
          <button
            onClick={handleAddAddress}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            + {t('addNew', 'Add New')}
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {t('noAddresses', 'No saved addresses')}
            </p>
            <button
              onClick={handleAddAddress}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {t('addFirstAddress', 'Add Your First Address')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedAddressId === address.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelect(address.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <input
                      type="radio"
                      checked={selectedAddressId === address.id}
                      onChange={() => onSelect(address.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{address.type}</span>
                        {address.is_default && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            {t('default', 'Default')}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mt-1">{address.street}</p>
                      <p className="text-gray-600 text-sm">
                        {address.city}, {address.province} {address.postal_code}
                      </p>
                      <p className="text-gray-600 text-sm">{address.country}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(address);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {t('edit', 'Edit')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      {t('delete', 'Delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {addresses.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={!selectedAddressId}
            className={`px-8 py-3 rounded-lg font-medium ${
              selectedAddressId
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('continue', 'Continue')}
          </button>
        </div>
      )}
    </div>
  );
}
