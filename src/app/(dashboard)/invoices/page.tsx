'use client';

import React, { useMemo, useState } from 'react';
import { useGetMyInvoicesQuery } from '@/redux/features/invoices/invoicesApi';
import { Icons } from '@/components/ui/Icons';
import { InvoiceDetailsModal } from '@/components/dashboard/InvoiceDetailsModal';

export default function InvoicesPage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const { data: response, isLoading } = useGetMyInvoicesQuery(undefined);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', color: '#666' }}>
        Loading invoices...
      </div>
    );
  }

  const invoiceList = Array.isArray(response?.data) ? response.data : [];
  
  const dueInvoices = invoiceList.filter((inv: any) => inv.status === 'DUE');
  const paidInvoices = invoiceList.filter((inv: any) => inv.status === 'PAID');

  const totalOutstanding = dueInvoices.reduce((acc: number, inv: any) => acc + parseFloat(inv.amount || '0'), 0);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const overdueInvoices = dueInvoices.filter((inv: any) => new Date(inv.createdAt) < thirtyDaysAgo);
  const overdueAmount = overdueInvoices.reduce((acc: number, inv: any) => acc + parseFloat(inv.amount || '0'), 0);

  const openInvoicesCount = dueInvoices.length;

  // Group DUE invoices by project address
  const groupedDueInvoices = dueInvoices.reduce((acc: any, inv: any) => {
    const address = inv.project?.address || 'Unknown Project';
    if (!acc[address]) acc[address] = [];
    acc[address].push(inv);
    return acc;
  }, {});

  return (
    <>
      <a className="backlink" href="/dashboard">
        <svg viewBox="0 0 24 24" fill="none" style={{width:14,height:14}}>
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Dashboard
      </a>

      <div className="pagehead">
        <div>
          <div className="tag">Billing</div>
          <h1>Invoices</h1>
          <div className="subtitle">Across all projects</div>
        </div>
      </div>

      {/* Balance summary cards */}
      <div className="balance-row">
        <div className="balance-card amber">
          <div className="b-lbl">Total outstanding</div>
          <div className="b-num">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="balance-card red">
          <div className="b-lbl">Overdue</div>
          <div className="b-num">${overdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="balance-card">
          <div className="b-lbl">Open invoices</div>
          <div className="b-num">{openInvoicesCount}</div>
        </div>
      </div>

      {/* Open invoices */}
      <div className="section-label">Open</div>

      {Object.keys(groupedDueInvoices).length === 0 ? (
        <div style={{color:'#666', fontSize:'14px', marginTop:'8px'}}>No open invoices found.</div>
      ) : (
        Object.keys(groupedDueInvoices).map(address => (
          <React.Fragment key={address}>
            <div className="inv-group-title">
              <span className="gt-ico">
                <Icons.home_dark style={{width:14,height:14}} />
              </span>
              {address}
            </div>
            
            {groupedDueInvoices[address].map((inv: any) => {
              const isOverdue = new Date(inv.createdAt) < thirtyDaysAgo;
              const dateText = `Issued ${new Date(inv.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;
              
              return (
                <a 
                  key={inv.invoiceId} 
                  className="inv-row" 
                  href="#" 
                  onClick={e => { e.preventDefault(); setSelectedInvoiceId(inv.invoiceId); }}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="inv-num">INV-{inv.invoiceNumber}</span>
                  <div className="inv-for">
                    {inv.description || 'Job Invoice'}
                    <div className="inv-date due">
                      {dateText} {isOverdue && <span className="due-rel overdue">&middot; Overdue</span>}
                    </div>
                  </div>
                  <span className="inv-amount">${parseFloat(inv.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={`inv-badge ${isOverdue ? 'overdue' : 'due'}`}>{isOverdue ? 'Overdue' : 'Due'}</span>
                  <span style={{ color: '#666', marginLeft: '8px' }}>
                    <Icons.chev style={{ width: 16, height: 16 }} />
                  </span>
                </a>
              );
            })}
          </React.Fragment>
        ))
      )}

      {/* Recently Paid */}
      <div className="section-label" style={{marginTop:'30px'}}>
        Recently Paid
      </div>
      
      {paidInvoices.length === 0 ? (
        <div style={{color:'#666', fontSize:'14px', marginTop:'8px'}}>No recently paid invoices.</div>
      ) : (
        paidInvoices.map((inv: any) => (
          <a 
            key={inv.invoiceId} 
            className="inv-row" 
            href="#" 
            onClick={e => { e.preventDefault(); setSelectedInvoiceId(inv.invoiceId); }}
            style={{ cursor: 'pointer' }}
          >
            <span className="inv-num">INV-{inv.invoiceNumber}</span>
            <div className="inv-for">
              {inv.description || 'Job Invoice'} &middot; {inv.project?.address || 'Unknown Project'}
              <div className="inv-date">Paid {new Date(inv.updatedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</div>
            </div>
            <span className="inv-amount">${parseFloat(inv.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="inv-badge paid">Paid</span>
            <span style={{ color: '#666', marginLeft: '8px' }}>
              <Icons.chev style={{ width: 16, height: 16 }} />
            </span>
          </a>
        ))
      )}

      <InvoiceDetailsModal 
        isOpen={!!selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)} 
        invoiceId={selectedInvoiceId} 
      />
    </>
  );
}
