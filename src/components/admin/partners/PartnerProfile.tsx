'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetPartnerByIdQuery, useUpdatePartnerTierMutation } from '@/redux/features/admin/adminApi';
import { AssignSTCustomerModal } from './AssignSTCustomerModal';
import { PartnerQuotesTable } from './PartnerQuotesTable';

export function PartnerProfile({ companyId }: { companyId: string }) {
  const { data: partnerResponse, isLoading, error } = useGetPartnerByIdQuery(companyId);
  const [updatePartnerTier] = useUpdatePartnerTierMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTier, setIsEditingTier] = useState(false);
  const [tierValue, setTierValue] = useState<number>(4);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading partner details...</div>
      </div>
    );
  }

  if (error || !partnerResponse) {
    return (
      <div style={{ padding: '24px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
        Failed to load partner details.
      </div>
    );
  }

  // The actual company object might be wrapped in a 'data' field depending on the interceptor
  const company = partnerResponse?.data || partnerResponse;

  const handleTierUpdate = async () => {
    try {
      await updatePartnerTier({ companyId, tier: tierValue }).unwrap();
      setIsEditingTier(false);
    } catch (err) {
      alert('Failed to update tier');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header section with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/partners" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Partners
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '100%', backgroundColor: '#4f46e5' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{company.name}</h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '1rem', color: '#4b5563' }}>
              {company.address || 'No physical address provided'}
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {isEditingTier ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <select 
                    value={tierValue} 
                    onChange={(e) => setTierValue(Number(e.target.value))}
                    style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
                  >
                    {[1, 2, 3, 4].map(t => <option key={t} value={t}>Tier {t}</option>)}
                  </select>
                  <button onClick={handleTierUpdate} style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setIsEditingTier(false)} style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                </span>
              ) : (
                <span 
                  style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#f3f4f6', color: '#374151', cursor: 'pointer' }}
                  onClick={() => {
                    setTierValue(company.tier);
                    setIsEditingTier(true);
                  }}
                  title="Click to edit tier"
                >
                  Tier {company.tier} Partner ✎
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#dbeafe', color: '#1e40af' }}>
                {company.stCustomers?.length || 0} ST Link(s)
              </span>
            </div>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Assign ST Customer
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Contact Info Card */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', fontWeight: 600, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Contact Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Primary Contact</span>
              <span style={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{company.contactName || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Portal User Email</span>
              <span style={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{company.users?.[0]?.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Sales Rep</span>
              <span style={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{company.repName || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Rep Phone</span>
              <span style={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{company.repPhone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Portal Stats Card */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', fontWeight: 600, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Portal Statistics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Projects</span>
              <span style={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{company._count?.projects || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Quotes</span>
              <span style={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{company._count?.quotes || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Invoices</span>
              <span style={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{company._count?.invoices || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Approved Jobs YTD</span>
              <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.875rem' }}>{company.approvedJobsYtd || 0} / {company.annualGoal || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ServiceTitan Customer Details Section */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Linked ServiceTitan Customers</h2>
        
        {(!company.stCustomers || company.stCustomers.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '40px 0', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem' }}>No ServiceTitan customers are linked to this partner.</p>
            <button className="btn-outline" style={{ marginTop: '16px' }} onClick={() => setIsModalOpen(true)}>
              Assign Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {company.stCustomers.map((mapping: any) => {
              const details = mapping.details;
              return (
                <div key={mapping.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', position: 'relative', transition: 'box-shadow 0.2s', backgroundColor: '#fdfbfa' }}>
                  <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      ID: {mapping.serviceTitanCustomerId}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
                      {details?.name ? details.name.substring(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111827', paddingRight: '80px' }}>
                        {details?.name || 'Customer Name Not Found'}
                      </h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                        {details?.type || 'Commercial'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <svg style={{ color: '#9ca3af', flexShrink: 0, marginTop: '2px' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                        {details?.contacts?.[0]?.value || 'No phone available'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <svg style={{ color: '#9ca3af', flexShrink: 0, marginTop: '2px' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                        {details?.email || 'No email available'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <svg style={{ color: '#9ca3af', flexShrink: 0, marginTop: '2px' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                        {details?.address?.street ? `${details.address.street}, ${details.address.city}, ${details.address.state} ${details.address.zip}` : 'No address available'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quotes Table Section */}
      <PartnerQuotesTable companyId={companyId} />

      {isModalOpen && (
        <AssignSTCustomerModal 
          companyId={companyId} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
