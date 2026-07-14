'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAssignSTCustomerMutation, useGetSTCustomersQuery } from '@/redux/features/admin/adminApi';

interface AssignSTCustomerModalProps {
  companyId: string;
  onClose: () => void;
}

export function AssignSTCustomerModal({ companyId, onClose }: AssignSTCustomerModalProps) {
  const [stCustomerId, setStCustomerId] = useState('');
  const [error, setError] = useState('');
  const [assignSTCustomer, { isLoading: isAssigning }] = useAssignSTCustomerMutation();
  const { data: stCustomersResponse, isLoading: isLoadingCustomers, error: customersError } = useGetSTCustomersQuery();

  const customers = stCustomersResponse?.data || stCustomersResponse || [];

  const handleAssign = async () => {
    setError('');
    if (!stCustomerId.trim()) {
      setError('Please select a ServiceTitan Customer.');
      return;
    }

    try {
      await assignSTCustomer({ 
        companyId, 
        serviceTitanCustomerId: stCustomerId.trim() 
      }).unwrap();
      onClose();
    } catch (err: any) {
      setError(err?.data?.message || err?.error || 'Failed to assign ServiceTitan Customer ID.');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Assign ServiceTitan Customer">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>
          Select a ServiceTitan Customer from the list to link to this partner. You can assign multiple IDs to the same partner by repeating this process.
        </p>

        <div className="field">
          <label>ServiceTitan Customer</label>
          {isLoadingCustomers ? (
            <div style={{ padding: '8px', fontSize: '14px', color: '#6b7280' }}>Loading customers from ServiceTitan...</div>
          ) : customersError ? (
            <div style={{ color: '#ef4444', fontSize: '13px' }}>Failed to load customers from ServiceTitan.</div>
          ) : (
            <select 
              value={stCustomerId} 
              onChange={(e) => setStCustomerId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb' }}
            >
              <option value="">-- Select a Customer --</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} (ID: {c.id})
                </option>
              ))}
            </select>
          )}
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '-8px' }}>
            {error}
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: '8px' }}>
          <button className="btn-ghost" onClick={onClose} disabled={isAssigning}>
            Cancel
          </button>
          <button className="btn-dark" onClick={handleAssign} disabled={isAssigning || isLoadingCustomers || !stCustomerId}>
            {isAssigning ? 'Saving...' : 'Save Mapping'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
