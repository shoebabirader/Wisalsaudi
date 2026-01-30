'use client';

import { useTranslation } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle
} from 'lucide-react';
import AddressForm from '@/components/checkout/AddressForm';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  recipientName?: string;
  recipientPhone?: string;
}

export default function AddressesPage() {
  const { t, language } = useTranslation('profile');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/addresses', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      
      // Mock data for now
      const mockAddresses: Address[] = [
        {
          id: '1',
          type: 'home',
          street: 'King Fahd Road, Building 123, Apt 45',
          city: 'Riyadh',
          province: 'Riyadh',
          postalCode: '11564',
          country: 'Saudi Arabia',
          isDefault: true,
          recipientName: 'Ahmed Al-Saud',
          recipientPhone: '+966501234567'
        },
        {
          id: '2',
          type: 'work',
          street: 'Olaya Street, Tower 5, Floor 12',
          city: 'Riyadh',
          province: 'Riyadh',
          postalCode: '11523',
          country: 'Saudi Arabia',
          isDefault: false,
          recipientName: 'Ahmed Al-Saud',
          recipientPhone: '+966501234567'
        }
      ];

      setAddresses(mockAddresses);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (addressData: Partial<Address>) => {
    try {
      // TODO: Call API to add address
      // const response = await fetch('/api/addresses', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(addressData)
      // });
      // const newAddress = await response.json();

      const newAddress: Address = {
        ...addressData as Address,
        id: Date.now().toString()
      };

      setAddresses([...addresses, newAddress]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleUpdateAddress = async (addressData: Partial<Address>) => {
    if (!editingAddress) return;

    try {
      // TODO: Call API to update address
      // await fetch(`/api/addresses/${editingAddress.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(addressData)
      // });

      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...addressData }
          : addr
      ));
      setEditingAddress(null);
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm(t('addresses.confirmDelete'))) {
      return;
    }

    setDeletingId(addressId);
    try {
      // TODO: Call API to delete address
      // await fetch(`/api/addresses/${addressId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });

      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } catch (error) {
      console.error('Failed to delete address:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // TODO: Call API to set default address
      // await fetch(`/api/addresses/${addressId}/set-default`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });

      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const getAddressTypeLabel = (type: Address['type']) => {
    const labels = {
      home: language === 'ar' ? 'المنزل' : 'Home',
      work: language === 'ar' ? 'العمل' : 'Work',
      other: language === 'ar' ? 'أخرى' : 'Other'
    };
    return labels[type];
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </Link>
            <h1 className="text-xl font-bold">{t('addresses.title')}</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (showAddForm || editingAddress) {
    // Convert address format for AddressForm component
    const addressForForm = editingAddress ? {
      id: editingAddress.id,
      type: editingAddress.type,
      street: editingAddress.street,
      city: editingAddress.city,
      province: editingAddress.province,
      postal_code: editingAddress.postalCode,
      country: editingAddress.country,
      is_default: editingAddress.isDefault
    } : null;

    return (
      <main className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAddress(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {editingAddress ? t('addresses.edit') : t('addresses.addNew')}
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          <AddressForm
            address={addressForForm}
            onSuccess={() => {
              setShowAddForm(false);
              setEditingAddress(null);
              fetchAddresses();
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingAddress(null);
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{t('addresses.title')}</h1>
        </div>
      </div>

      {/* Addresses List */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Add New Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-primary hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">{t('addresses.addNew')}</span>
        </button>

        {addresses.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('addresses.empty')}
            </h2>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-lg border-2 p-4 transition-all ${
                  address.isDefault 
                    ? 'border-primary shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Address Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                      {getAddressTypeLabel(address.type)}
                    </span>
                    {address.isDefault && (
                      <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {t('addresses.default')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Address Details */}
                <div className="mb-4">
                  {address.recipientName && (
                    <p className="font-semibold text-gray-900 mb-1">
                      {address.recipientName}
                    </p>
                  )}
                  <p className="text-gray-700">{address.street}</p>
                  <p className="text-gray-700">
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p className="text-gray-700">{address.country}</p>
                  {address.recipientPhone && (
                    <p className="text-gray-600 text-sm mt-1">
                      {address.recipientPhone}
                    </p>
                  )}
                </div>

                {/* Address Actions */}
                <div className="flex gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {t('addresses.setDefault')}
                    </button>
                  )}
                  <button
                    onClick={() => setEditingAddress(address)}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    {t('addresses.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={deletingId === address.id}
                    className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('addresses.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
