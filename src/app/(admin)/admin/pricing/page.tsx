"use client";

import React, { useState, useEffect } from "react";
import {
  useGetPricingConfigQuery,
  useUpdatePricingConfigMutation,
} from "../../../../redux/api/pricingApi";
import { Icons } from "@/components/ui/Icons";

export default function AdminPricingPage() {
  const { data: config, isLoading } = useGetPricingConfigQuery();
  const [updateConfig, { isLoading: isUpdating }] =
    useUpdatePricingConfigMutation();

  const [localConfig, setLocalConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("base");
  const [isSaved, setIsSaved] = useState(false);
  const [advancedJson, setAdvancedJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    if (config?.data) {
      setLocalConfig(JSON.parse(JSON.stringify(config.data)));
      setAdvancedJson(JSON.stringify(config.data, null, 2));
    }
  }, [config]);

  const handleSave = async () => {
    try {
      let payload = localConfig;
      if (activeTab === "advanced") {
        payload = JSON.parse(advancedJson);
        setLocalConfig(payload);
      }
      await updateConfig(payload).unwrap();
      setIsSaved(true);
      setJsonError("");
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setJsonError("Invalid JSON format. Please correct it before saving.");
      } else {
        alert("Failed to save pricing configuration.");
      }
    }
  };

  if (isLoading || !localConfig) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Icons.spinner className="animate-spin" /> Loading Pricing Engine...
      </div>
    );
  }

  const handleBaseChange = (key: string, value: number) => {
    setLocalConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleTierChange = (tier: string, value: number) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      TIER_ANCHORS: { ...prev.TIER_ANCHORS, [tier]: value },
    }));
  };

  const handleSystemAddonChange = (index: number, key: string, value: any) => {
    const newAddons = [...localConfig.SYSTEM_ADDON_DEFS];
    newAddons[index] = { ...newAddons[index], [key]: value };
    setLocalConfig({ ...localConfig, SYSTEM_ADDON_DEFS: newAddons });
  };

  const handleProjectAddonChange = (index: number, key: string, value: any) => {
    const newAddons = [...localConfig.PROJECT_ADDON_DEFS];
    newAddons[index] = { ...newAddons[index], [key]: value };
    setLocalConfig({ ...localConfig, PROJECT_ADDON_DEFS: newAddons });
  };

  return (
    <>
      <div className="pagehead" style={{ marginBottom: 20 }}>
        <div>
          <div className="tag">Configuration</div>
          <h1>Pricing Engine</h1>
          <div className="subtitle">
            Manage base rates, multipliers, and add-on pricing dynamically.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {isSaved && <span style={{ color: "var(--rhino)", fontWeight: 700, fontSize: 14 }}>Changes Saved ✓</span>}
          {jsonError && <span style={{ color: "#b3261e", fontWeight: 700, fontSize: 14 }}>{jsonError}</span>}
          <button onClick={handleSave} disabled={isUpdating} className="btn-primary">
            {isUpdating ? <Icons.spinner className="animate-spin" /> : <Icons.check />}
            Save Configuration
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 24, paddingLeft: 6 }}>
        {[
          { id: "base", label: "Base Rates & Tiers" },
          { id: "addons", label: "System Add-ons" },
          { id: "project_addons", label: "Project Add-ons" },
          { id: "advanced", label: "Advanced (JSON Editor)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel">
        {activeTab === "base" && (
          <div className="card">
            <h2 className="card-title"><Icons.settings /> Core Multipliers</h2>
            <div className="grid-2" style={{ marginBottom: 30 }}>
              <div className="field">
                <label>Per Ton Rate ($)</label>
                <input
                  type="number"
                  value={localConfig.PER_TON}
                  onChange={(e) => handleBaseChange("PER_TON", Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Nest Thermostat ($)</label>
                <input
                  type="number"
                  value={localConfig.NEST_RATE}
                  onChange={(e) => handleBaseChange("NEST_RATE", Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>First Zone Rate ($)</label>
                <input
                  type="number"
                  value={localConfig.ZONE_FIRST}
                  onChange={(e) => handleBaseChange("ZONE_FIRST", Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Addl. Zone Rate ($)</label>
                <input
                  type="number"
                  value={localConfig.ZONE_ADDL}
                  onChange={(e) => handleBaseChange("ZONE_ADDL", Number(e.target.value))}
                />
              </div>
            </div>

            <h2 className="card-title" style={{ marginTop: 24, borderTop: "2px solid var(--line)", paddingTop: 24 }}><Icons.award /> Tier Anchors (Base for 5-Ton)</h2>
            <div className="grid-2">
              {[1, 2, 3, 4].map((tier) => (
                <div className="field" key={tier}>
                  <label>Tier {tier} Base ($)</label>
                  <input
                    type="number"
                    value={localConfig.TIER_ANCHORS[tier]}
                    onChange={(e) => handleTierChange(tier.toString(), Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "addons" && (
          <div>
            <div className="attention">
              <div className="att-head">
                <div className="ico"><Icons.settings /></div>
                <h2>System Add-ons</h2>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", paddingBottom: 10 }}>
                Adjust the base rate logic for system-level add-ons. Note: Add-ons that map to exact tier variants or complex logic can be configured in the Advanced tab.
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 15 }}>
              {localConfig.SYSTEM_ADDON_DEFS.map((addon: any, index: number) => (
                <div key={addon.id} className="card" style={{ marginBottom: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{addon.name}</div>
                  <div style={{ fontSize: 13, color: "var(--steel)", marginBottom: 16 }}>{addon.desc || 'No description'}</div>
                  
                  {addon.rate !== undefined && (
                    <div className="field">
                      <label>Standard Rate ($)</label>
                      <input
                        type="number"
                        value={addon.rate}
                        onChange={(e) => handleSystemAddonChange(index, "rate", Number(e.target.value))}
                      />
                    </div>
                  )}
                  {addon.ductlessRate !== undefined && (
                    <div className="field" style={{ marginTop: 10 }}>
                      <label>Ductless Rate ($)</label>
                      <input
                        type="number"
                        value={addon.ductlessRate}
                        onChange={(e) => handleSystemAddonChange(index, "ductlessRate", Number(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "project_addons" && (
          <div>
             <div className="attention">
              <div className="att-head">
                <div className="ico"><Icons.duct /></div>
                <h2>Project Add-ons</h2>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", paddingBottom: 10 }}>
                Adjust project-wide flat rates and multi-row configurations (e.g., Grills).
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 15 }}>
              {localConfig.PROJECT_ADDON_DEFS.map((addon: any, index: number) => (
                <div key={addon.id} className="card" style={{ marginBottom: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>{addon.name}</div>
                  
                  {addon.rate !== undefined && (
                    <div className="field">
                      <label>Rate ($) {addon.unit ? `per ${addon.unit}` : ''}</label>
                      <input
                        type="number"
                        value={addon.rate}
                        onChange={(e) => handleProjectAddonChange(index, "rate", Number(e.target.value))}
                      />
                    </div>
                  )}

                  {addon.rows && (
                    <div style={{ marginTop: 10 }}>
                      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Sub-Items Rates</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {addon.rows.map((row: any, rIndex: number) => (
                          <div key={row.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--paper-2)", padding: "10px 14px", borderRadius: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{row.label}</span>
                            <div className="field" style={{ marginBottom: 0, width: 100 }}>
                              <input
                                type="number"
                                style={{ padding: "8px 12px", fontSize: 14 }}
                                value={row.rate}
                                onChange={(e) => {
                                  const newRows = [...addon.rows];
                                  newRows[rIndex] = { ...newRows[rIndex], rate: Number(e.target.value) };
                                  handleProjectAddonChange(index, "rows", newRows);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div>
            <div className="attention" style={{ borderLeftColor: "#b0341f" }}>
              <div className="att-head">
                <div className="ico" style={{ background: "#fce8e6", color: "#b0341f" }}><Icons.alertTriangle /></div>
                <h2 style={{ color: "#b0341f" }}>Danger Zone: Raw JSON Editor</h2>
              </div>
              <div style={{ fontSize: 13, color: "var(--steel)", paddingBottom: 10 }}>
                Modify complex structures like Brands, Efficiencies, Ductless Sets, and Head Adders. Ensure the JSON is valid before saving.
              </div>
            </div>
            
            <textarea
              value={advancedJson}
              onChange={(e) => {
                setAdvancedJson(e.target.value);
                setJsonError("");
              }}
              spellCheck={false}
              style={{
                width: "100%", height: 600, padding: 20, borderRadius: 14,
                fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6,
                background: "var(--paper-2)", border: "2px solid var(--line)", color: "var(--ink)",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--rhino)"}
              onBlur={(e) => e.target.style.borderColor = "var(--line)"}
            />
          </div>
        )}
      </div>
    </>
  );
}
