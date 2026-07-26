"use client";

import React, { useState, useEffect } from "react";
import {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
} from "@/redux/features/admin/adminApi";

import { Icons } from "@/components/ui/Icons";

export default function AdminSettingsPage() {
  const { data: configData, isLoading, refetch } = useGetSystemConfigQuery();
  const [updateConfig, { isLoading: isUpdating }] =
    useUpdateSystemConfigMutation();

  const [fallbackSoldBy, setFallbackSoldBy] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const configArray = configData?.data || configData;
    if (Array.isArray(configArray)) {
      const soldByConfig = configArray.find(
        (c: any) => c.key === "ST_PARTNER_PORTAL_EMPLOYEE_ID",
      );
      if (soldByConfig) {
        setFallbackSoldBy(soldByConfig.value);
      }
    }
  }, [configData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    try {
      await updateConfig({
        key: "ST_PARTNER_PORTAL_EMPLOYEE_ID",
        value: fallbackSoldBy,
      }).unwrap();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      refetch();
    } catch (err) {
      console.error("Failed to update config", err);
      alert("Failed to save settings. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: 60,
          textAlign: "center",
          color: "var(--muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Icons.spinner className="animate-spin" /> Loading Settings...
      </div>
    );
  }

  return (
    <>
      <div className="pagehead" style={{ marginBottom: 20 }}>
        <div>
          <div className="tag">Configuration</div>
          <h1>System Settings</h1>
          {/* <div className="subtitle">
            Manage global application settings and third-party integrations.
          </div> */}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {saveSuccess && (
            <span
              style={{ color: "var(--rhino)", fontWeight: 700, fontSize: 14 }}
            >
              Settings Saved ✓
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="btn-primary"
          >
            {isUpdating ? (
              <Icons.spinner className="animate-spin" />
            ) : (
              <Icons.check />
            )}
            Save Settings
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="card" style={{ maxWidth: 600 }}>
          <h2 className="card-title">Fallback Sales Attribution</h2>

          <div className="field" style={{ marginTop: 20 }}>
            <label>Partner Portal Employee ID (soldBy Fallback)</label>
            <p
              style={{ fontSize: 12, color: "var(--steel)", marginBottom: 12 }}
            >
              This Employee ID is used when a Change Order is approved via the
              portal, but the original estimate in ServiceTitan is missing a{" "}
              <strong>soldBy</strong> employee assignment.
            </p>
            <input
              type="text"
              value={fallbackSoldBy}
              onChange={(e) => setFallbackSoldBy(e.target.value)}
              placeholder="e.g. 1055523"
              style={{ padding: "12px 16px", fontSize: 15 }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
