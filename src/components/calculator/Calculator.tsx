"use client";

import React, { useState, useEffect } from "react";
import {
  ProjectState,
  SystemState,
  brandOf,
  effOf,
  hasConcealedHead,
} from "./calculatorUtils";
import SystemCard from "./SystemCard";
import ProjectAddons from "./ProjectAddons";
import EstimatePanel from "./EstimatePanel";
import ConfirmModal from "./ConfirmModal";
import { TIER_ANCHORS, setPricingConfig } from "./calculatorData";
import { useGetPricingConfigQuery } from "../../redux/api/pricingApi";
import { useGetMeQuery } from "../../redux/features/auth/authApi";
import { useGetProjectByIdQuery } from "../../redux/features/projects/projectsApi";
import { useGetQuoteByIdQuery } from "../../redux/api/quoteApi";
import "./calculator.css";

const newSystem = (id: number): SystemState => ({
  id: id,
  sysType: "ducted",
  brand: "goodman",
  tier: "standard",
  tons: 5,
  addons: {},
  notes: "",
  miniId: "acpro_12k",
  multiCondenserId: "",
  multiHeads: {},
  heads: [{ id: 1, type: "wall", btu: "12k", name: "" }],
});

const defaultProject: ProjectState = {
  tier: 4,
  anchor: 16500,
  addons: {},
  builder: "Mid Construction Group",
  address: "",
  quoteNumber: "",
  quoteDate: "",
  quoteExpiry: "",
  confirmedOnce: false,
  revisedFrom: "",
};

export default function Calculator({ projectId, quoteId }: { projectId?: string; quoteId?: string }) {
  const [project, setProject] = useState<ProjectState>(defaultProject);
  const [systems, setSystems] = useState<SystemState[]>([newSystem(1)]);
  const [nextSysId, setNextSysId] = useState(2);
  const [showConfirm, setShowConfirm] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const { data: config, isLoading, isError } = useGetPricingConfigQuery();
  const { data: userProfile } = useGetMeQuery(undefined);
  const { data: existingProjectResponse, isLoading: isLoadingExisting } = useGetProjectByIdQuery(projectId as string, { skip: !projectId });
  const { data: existingQuote, isLoading: isLoadingQuote } = useGetQuoteByIdQuery(quoteId as string, { skip: !quoteId });

  useEffect(() => {
    if (config?.data) {
      setPricingConfig(config.data);
      setConfigLoaded(true);
    }
  }, [config]);

  useEffect(() => {
    const unwrappedProfile = userProfile?.data || userProfile;
    if (unwrappedProfile?.company) {
      const customers = unwrappedProfile.company.stCustomers || [];
      const firstCustomer = customers[0];
      setProject((prev) => {
        // If we already set these from an existing project, don't overwrite them
        if (projectId && prev.builder !== "No Builder Assigned") {
          return {
            ...prev,
            tier: unwrappedProfile.company.tier || 4,
            anchor: TIER_ANCHORS[unwrappedProfile.company.tier || 4] || prev.anchor,
          };
        }

        const tier = unwrappedProfile.company.tier || 4;
        const anchor = TIER_ANCHORS[tier] || prev.anchor;
        
        return {
          ...prev,
          builder: firstCustomer ? (firstCustomer.serviceTitanName || "Unknown Builder") : "No Builder Assigned",
          stCustomerId: firstCustomer ? firstCustomer.serviceTitanCustomerId : undefined,
          tier,
          anchor,
        };
      });
    }
  }, [userProfile, projectId]);

  useEffect(() => {
    if (projectId && existingProjectResponse?.data) {
      const existingProject = existingProjectResponse.data;
      setProject((prev) => ({
        ...prev,
        builder: existingProject.builderName || prev.builder,
        address: existingProject.address || prev.address,
        stCustomerId: existingProject.serviceTitanCustomerId || prev.stCustomerId, // Might need to fetch ST Customer ID if we have it, or rely on company defaults
      }));
    }
  }, [projectId, existingProjectResponse]);

  useEffect(() => {
    if (quoteId && existingQuote) {
      if (existingQuote.payload) {
        if (existingQuote.payload.project) {
          setProject(existingQuote.payload.project);
        }
        if (existingQuote.payload.systems) {
          setSystems(existingQuote.payload.systems);
          setNextSysId(Math.max(...existingQuote.payload.systems.map((s: any) => s.id)) + 1);
        }
      }
    }
  }, [quoteId, existingQuote]);

  useEffect(() => {
    if (quoteId) return; // Don't generate new date/id if editing existing quote
    const quoteDate = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    setProject((prev) => ({
      ...prev,
      quoteNumber: `RA-${Math.floor(100000 + Math.random() * 900000)}`,
      quoteDate: quoteDate.toLocaleDateString("en-US", dateOptions),
      quoteExpiry: expiry.toLocaleDateString("en-US", dateOptions),
    }));
  }, []);

  const handleSystemChange = (index: number, updatedSys: SystemState) => {
    const newSystems = [...systems];
    newSystems[index] = updatedSys;
    setSystems(newSystems);
  };

  const addSystem = () => {
    setSystems([...systems, newSystem(nextSysId)]);
    setNextSysId(nextSysId + 1);
  };

  const removeSystem = (index: number) => {
    if (systems.length > 1) {
      const newSystems = [...systems];
      newSystems.splice(index, 1);
      setSystems(newSystems);
    }
  };

  const handleReset = () => {
    const unwrappedProfile = userProfile?.data || userProfile;
    const customers = unwrappedProfile?.company?.stCustomers || [];
    const firstCustomer = customers[0];
    const tier = unwrappedProfile?.company?.tier || 4;
    const anchor = TIER_ANCHORS[tier] || 16500;

    const quoteDate = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    setProject({
      ...defaultProject,
      builder: firstCustomer ? (firstCustomer.serviceTitanName || "Unknown Builder") : "No Builder Assigned",
      stCustomerId: firstCustomer ? firstCustomer.serviceTitanCustomerId : undefined,
      tier,
      anchor,
      quoteNumber: `RA-${Math.floor(100000 + Math.random() * 900000)}`,
      quoteDate: quoteDate.toLocaleDateString("en-US", dateOptions),
      quoteExpiry: expiry.toLocaleDateString("en-US", dateOptions),
    });
    setSystems([newSystem(Date.now())]);
    setNextSysId(Date.now() + 1);
  };

  const anyDuctless = systems.some(
    (s) => s.sysType === "mini" || s.sysType === "multi",
  );
  const anyConcealed = systems.some((s) => hasConcealedHead(s));
  const showDuctlessIncludes = anyDuctless && !anyConcealed;

  // calculator-9: tier anchors display reflects brand + efficiency adjustment of the reference system,
  // but only when the reference system is ducted.
  const ref = systems[0];
  const tierAdj =
    ref && ref.sysType === "ducted" ? brandOf(ref).delta + effOf(ref).delta : 0;

  if (isLoading || !configLoaded || isLoadingExisting || isLoadingQuote) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg font-medium text-gray-500">Loading calculator...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg font-medium text-red-500">Failed to load pricing data. Please contact admin.</div>
      </div>
    );
  }

  return (
    <div id="appWrap">
      <div className="preview-ribbon" aria-hidden="true">
        <span>Preview</span>
      </div>
      <div className="wrap">
        <header>
          <div className="brand">
            <img src="/logo.png" alt="Rhino Air" className="logo-img" />
            <div className="brand-text">
              <div className="tag">
                Single Family · Residential New Construction · HVAC
              </div>
              <h1>Installation Estimate</h1>
              <div className="subtag">
                For General Contractors &amp; Developers
              </div>
            </div>
          </div>
          <div className="contacts">
            <div className="contact-block">
              <div className="c-name">Sam Yaghobi</div>
              <a href="mailto:sam.yaghobi@rhinoair.com">
                sam.yaghobi@rhinoair.com
              </a>
              <a href="tel:+18189004007">(818) 900-4007 · cell</a>
            </div>
            <div className="contact-block">
              <div className="c-name">Rhino Air — Office</div>
              <a href="tel:+18185358888">(818) 535-8888</a>
              <a href="mailto:info@rhinoair.com">info@rhinoair.com</a>
              <div className="c-lic">License # C20-1142997</div>
              <div className="c-lic">OSHA # 26-607683422</div>
            </div>
          </div>
        </header>

        <div className="grid">
          <div className="config">
            <div className="block">
              <div className="section-label">Project</div>
              <div className="proj-field">
                <label htmlFor="builderName">Builder / company name</label>
                {(() => {
                  const unwrappedProfile = userProfile?.data || userProfile;
                  const customers = unwrappedProfile?.company?.stCustomers || [];
                  
                  if (projectId || quoteId) {
                    return (
                      <input
                        id="builderName"
                        className="locked-input"
                        type="text"
                        readOnly
                        value={project.builder}
                        disabled
                      />
                    );
                  }

                  return customers.length > 1 ? (
                    <select
                      id="builderName"
                      value={project.stCustomerId || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedCust = customers.find((c: any) => c.serviceTitanCustomerId === selectedId);
                        setProject({
                          ...project,
                          stCustomerId: selectedId,
                          builder: selectedCust ? (selectedCust.serviceTitanName || "Unknown Builder") : "No Builder Assigned",
                        });
                      }}
                    >
                      {customers.map((c: any) => (
                        <option key={c.serviceTitanCustomerId} value={c.serviceTitanCustomerId}>
                          {c.serviceTitanName || "Unknown Builder"}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="builderName"
                      className="locked-input"
                      type="text"
                      readOnly
                      value={project.builder}
                    />
                  );
                })()}
              </div>
              <div className="proj-field">
                <label htmlFor="projAddress">Project address</label>
                <input
                  id="projAddress"
                  type="text"
                  placeholder="e.g. 1234 Oak Street, Los Angeles, CA 90001"
                  value={project.address}
                  onChange={(e) =>
                    setProject({ ...project, address: e.target.value })
                  }
                  readOnly={!!projectId || !!quoteId}
                  disabled={!!projectId || !!quoteId}
                  style={(projectId || quoteId) ? { backgroundColor: '#f5f5f5', color: '#666' } : {}}
                />
              </div>
            </div>

            <div className="block" id="volumeBlock">
              <div className="section-label">Project Volume</div>
              <div className="tier-grid passive" id="volumeTier">
                {[1, 2, 3, 4].map((tier) => (
                  <div
                    key={tier}
                    className={`opt tier ${project.tier === tier ? "active" : ""}`}
                    data-tier={tier}
                  >
                    <span className="tier-badge">Your tier</span>
                    <div className="ttl">Tier {tier}</div>
                    <div className="tier-range">
                      {tier === 1
                        ? "1–3 projects"
                        : tier === 2
                          ? "4–9 projects"
                          : tier === 3
                            ? "10–15 projects"
                            : "15+ projects"}
                    </div>
                    <div className="tier-anchor">
                      ${(TIER_ANCHORS[tier] + tierAdj).toLocaleString("en-US")}{" "}
                      <span style={{ opacity: 0.6 }}>/ ducted 5-ton</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="included-note">
                <b>Volume pricing:</b> higher project volume lowers the base
                price per system. Your tier applies to every system in this
                project, including mini-split &amp; multi-split. Prices shown
                are the ducted central 5-ton reference.{" "}
                <i>One project = one single-family residential house.</i>
              </div>
            </div>

            <div className="block">
              <div className="section-label">Systems</div>
              <div
                className="included-note"
                id="includesDucted"
                style={{
                  display: showDuctlessIncludes ? "none" : "block",
                  marginTop: 0,
                  marginBottom: 16,
                }}
              >
                <b>Base price includes (per system):</b>
                <ul className="includes-list">
                  <li>
                    <b>Heat Pump System</b> (Goodman, AC Pro, or Daikin)
                  </li>
                  <li>R-6 Flex Insulated Ducting</li>
                  <li>One standard thermostat</li>
                  <li>Single Zone System</li>
                  <li>Standard diffusers &amp; air grills</li>
                  <li>Ductwork, line set &amp; startup</li>
                  <li>Low-voltage wiring</li>
                  <li>Drain line, drain pan &amp; condenser pad</li>
                  <li className="includes-warranty">
                    <b>1-Year Labor Warranty</b> · <b>Manufacturer Warranty</b>{" "}
                    (10-yr Goodman / AC Pro · 12-yr Daikin)
                  </li>
                </ul>
              </div>
              <div
                className="included-note"
                id="includesDuctless"
                style={{
                  display: showDuctlessIncludes ? "block" : "none",
                  marginTop: 0,
                  marginBottom: 16,
                }}
              >
                <b>Base price includes (per system):</b>
                <ul className="includes-list">
                  <li>
                    <b>Inverter Condenser</b> (Goodman, AC Pro, or Daikin)
                  </li>
                  <li>Indoor head(s) — wall, cassette or concealed</li>
                  <li>Wireless remote / controller per zone</li>
                  <li>Line set, refrigerant &amp; startup</li>
                  <li>Condensate drain &amp; pump (as needed)</li>
                  <li>Low-voltage wiring</li>
                  <li>Wall sleeve &amp; mounting hardware</li>
                  <li>Condenser pad or wall bracket</li>
                  <li className="includes-warranty">
                    <b>1-Year Labor Warranty</b> · <b>Manufacturer Warranty</b>{" "}
                    (10-yr Goodman / AC Pro · 12-yr Daikin)
                  </li>
                </ul>
              </div>

              <div id="systemsContainer">
                {systems.map((s, i) => (
                  <SystemCard
                    key={s.id}
                    system={s}
                    index={i}
                    project={project}
                    systemsLength={systems.length}
                    onChange={(sys) => handleSystemChange(i, sys)}
                    onRemove={() => removeSystem(i)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="add-system-btn"
                id="addSystemBtn"
                onClick={addSystem}
              >
                + Add another system
              </button>
            </div>

            <div className="block">
              <div className="section-label">Project Add-Ons</div>
              <div className="proj-addons-note">
                Counted once per house — except where marked per system
              </div>
              <ProjectAddons project={project} onChange={setProject} />
            </div>
          </div>

          <EstimatePanel
            project={project}
            systems={systems}
            onOpenConfirm={() => setShowConfirm(true)}
            onReset={handleReset}
          />
        </div>
      </div>

      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        project={project}
        systems={systems}
        onConfirm={() => setProject({ ...project, confirmedOnce: true })}
        onPrint={() => {
          const btn = document.getElementById(
            "panelPrintBtn",
          ) as HTMLButtonElement | null;
          btn?.click();
        }}
        projectId={projectId}
        quoteId={quoteId}
      />
      <div id="printDoc" aria-hidden="true"></div>
    </div>
  );
}
