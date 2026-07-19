'use client';

import React, { useState } from 'react';
import { useGetPartnerQuotesQuery } from '@/redux/features/admin/adminApi';

export function PartnerQuotesTable({ companyId }: { companyId: string }) {
  const { data: quotesResponse, isLoading, error } = useGetPartnerQuotesQuery(companyId);
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  if (isLoading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading quotes...</div>;
  }

  if (error) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444' }}>Failed to load quotes.</div>;
  }

  const quotes = quotesResponse?.data || quotesResponse || [];

  if (quotes.length === 0) {
    return (
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Partner Quotes</h3>
        <div style={{ textAlign: 'center', padding: '40px 0', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>This partner has not submitted any quotes yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Partner Quotes</h3>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Quote ID</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Builder / Address</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Scope & Tier</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Total Price</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote: any) => (
              <React.Fragment key={quote.quoteId}>
                <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: expandedQuoteId === quote.quoteId ? '#f9fafb' : 'transparent' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{quote.quoteNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: '#111827', fontWeight: 500 }}>{quote.builderName}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{quote.projectAddress}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: '#374151' }}>{quote.scope || 'N/A'}</div>
                    <div style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: '#e0e7ff', color: '#3730a3', fontWeight: 500 }}>
                      {quote.tierLabel || 'No Tier'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: quote.status === 'ACCEPTED' ? '#dcfce7' : '#f3f4f6',
                      color: quote.status === 'ACCEPTED' ? '#166534' : '#374151'
                    }}>
                      {quote.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                    ${Number(quote.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => setExpandedQuoteId(expandedQuoteId === quote.quoteId ? null : quote.quoteId)}
                      style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                    >
                      {expandedQuoteId === quote.quoteId ? 'Hide Details' : 'View Payload'}
                    </button>
                  </td>
                </tr>
                {expandedQuoteId === quote.quoteId && (
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <td colSpan={6} style={{ padding: '24px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quote Payload Systems</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {quote.payload?.systems?.map((sys: any, idx: number) => (
                          <div key={idx} style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <strong style={{ color: '#0f172a' }}>System {sys.id}: {sys.name || 'Unnamed'}</strong>
                              <span style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'capitalize' }}>
                                {sys.brand} • {sys.tier} Tier • {sys.tons} Tons
                              </span>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                              Type: {sys.sysType}
                              {sys.notes && <div style={{ marginTop: 4 }}><em>Notes: {sys.notes}</em></div>}
                            </div>
                          </div>
                        ))}
                        {(!quote.payload?.systems || quote.payload.systems.length === 0) && (
                          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>No system details available in payload.</div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
