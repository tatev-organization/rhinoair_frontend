'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetPartnersQuery, useRemoveSTCustomerMutation } from '@/redux/features/admin/adminApi';
import { AssignSTCustomerModal } from './AssignSTCustomerModal';

export function PartnerListTable() {
  const { data: partnersResponse, isLoading, error } = useGetPartnersQuery();
  const [removeSTCustomer] = useRemoveSTCustomerMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  if (isLoading) return <div style={{ padding: '20px' }}>Loading partners...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Failed to load partners</div>;

  const partners = partnersResponse?.data || partnersResponse || [];

  const handleAssignClick = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsModalOpen(true);
  };

  const handleRemoveMapping = async (companyId: string, stId: string) => {
    if (confirm('Are you sure you want to remove this ServiceTitan mapping?')) {
      try {
        await removeSTCustomer({ companyId, stCustomerId: stId }).unwrap();
      } catch (err) {
        alert('Failed to remove mapping');
      }
    }
  };

  return (
    <>
      <div style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Registered Partners</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>Manage partner companies and their ServiceTitan integration.</p>
          </div>
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => alert('Onboarding flow coming soon!')}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Onboard Partner
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Partner Details</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tier</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ServiceTitan Mapping</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
              {partners.map((partner: any) => (
                <tr key={partner.companyId} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px' }}>
                    <Link href={`/admin/partners/${partner.companyId}`} style={{ fontWeight: 600, color: '#4f46e5', textDecoration: 'none' }}>
                      {partner.name}
                    </Link>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '2px' }}>
                      {partner.users?.[0]?.email || 'No user linked'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: '#374151', fontSize: '0.875rem' }}>{partner.contactName || 'N/A'}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '2px' }}>{partner.address || 'No address provided'}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, backgroundColor: '#f3f4f6', color: '#374151' }}>
                      Tier {partner.tier}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {partner.stCustomers && partner.stCustomers.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {partner.stCustomers.map((mapping: any) => (
                          <div key={mapping.serviceTitanCustomerId} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid #bfdbfe' }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {mapping.serviceTitanCustomerId}
                            <button 
                              onClick={() => handleRemoveMapping(partner.companyId, mapping.serviceTitanCustomerId)}
                              style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
                              title="Remove ST ID"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '0.875rem' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link 
                        href={`/admin/partners/${partner.companyId}`}
                        style={{ padding: '6px 12px', fontSize: '0.875rem', border: '1px solid #d1d5db', borderRadius: '6px', color: '#374151', textDecoration: 'none', backgroundColor: '#ffffff' }}
                      >
                        View Details
                      </Link>
                      <button 
                        className="btn-ghost" 
                        style={{ padding: '6px 12px', fontSize: '0.875rem', color: '#4f46e5' }}
                        onClick={() => handleAssignClick(partner.companyId)}
                      >
                        + Assign ST ID
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#d1d5db">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>No partners found.</p>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>Get started by onboarding a new partner.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedCompanyId && (
        <AssignSTCustomerModal 
          companyId={selectedCompanyId} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCompanyId(null);
          }} 
        />
      )}
    </>
  );
}
