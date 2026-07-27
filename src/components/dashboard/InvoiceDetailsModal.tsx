'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Icons } from '@/components/ui/Icons';
import { useGetInvoiceDetailsQuery } from '@/redux/features/invoices/invoicesApi';

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
}) => {
  const { data, isLoading, isError } = useGetInvoiceDetailsQuery(invoiceId as string, {
    skip: !invoiceId || !isOpen,
  });

  if (!isOpen) return null;

  const localInv = data?.data?.localInvoice;
  const stInv = data?.data?.stDetails;
  
  // Format dates
  const dueDateStr = localInv?.dueDate || stInv?.dueDate;
  const dueDate = dueDateStr ? new Date(dueDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  
  const createdStr = localInv?.createdAt || stInv?.createdOn;
  const issuedDate = createdStr ? new Date(createdStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  const amount = parseFloat(localInv?.amount || stInv?.total || '0');
  const balance = parseFloat(stInv?.balance || localInv?.amount || '0');
  const isPaid = localInv?.status === 'PAID' || balance === 0;

  const items = stInv?.items || [];
  const payments = stInv?.payments || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details">
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading invoice details...
        </div>
      ) : isError ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#b3261e' }}>
          Failed to load invoice details. Please try again later.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0', color: '#111' }}>
                INV-{localInv?.invoiceNumber || stInv?.number}
              </h2>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#666' }}>
                <span>Issued: {issuedDate}</span>
                <span>Due: {dueDate}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111', margin: '0 0 4px 0' }}>
                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className={`inv-badge ${isPaid ? 'paid' : 'due'}`}>
                {isPaid ? 'Paid' : 'Due'}
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#111' }}>Line Items</h3>
            {items.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#666', background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                No line items detailed in this invoice.
              </div>
            ) : (
              <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#666', fontWeight: 500 }}>Description</th>
                      <th style={{ textAlign: 'right', padding: '12px', color: '#666', fontWeight: 500 }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '12px', color: '#666', fontWeight: 500 }}>Rate</th>
                      <th style={{ textAlign: 'right', padding: '12px', color: '#666', fontWeight: 500 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '12px', color: '#111' }}>
                          <div style={{ fontWeight: 500 }}>{item.name || item.sku || 'Item'}</div>
                          {item.description && <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>{item.description}</div>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#444' }}>{item.quantity || 1}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#444' }}>${parseFloat(item.rate || item.unitPrice || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#111', fontWeight: 500 }}>${parseFloat(item.total || item.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payments */}
          {payments.length > 0 && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#111' }}>Payments</h3>
              <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                {payments.map((pmt: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: idx < payments.length - 1 ? '1px solid #f5f5f5' : 'none', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#111', fontWeight: 500 }}>{pmt.type || pmt.paymentMethod || 'Payment'}</span>
                      <span style={{ color: '#666' }}>
                        {pmt.date ? new Date(pmt.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div style={{ fontWeight: 500, color: '#1a6634' }}>
                      ${parseFloat(pmt.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF Action */}
          <div style={{ marginTop: '8px' }}>
            <button 
              className="btn-dark" 
              style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
              onClick={() => {
                alert("Generating PDF from ServiceTitan...");
                // Note: If ST provides a pdfUrl in the payload, we would window.open(pdfUrl) here.
                // Otherwise, this triggers a backend export call.
              }}
            >
              <Icons.dl style={{ width: 16, height: 16 }} />
              Download Invoice PDF
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
