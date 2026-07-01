'use client';

import React, { useState, useEffect } from 'react';
import { ProjectState, SystemState } from './calculatorUtils';
import SystemCard from './SystemCard';
import ProjectAddons from './ProjectAddons';
import EstimatePanel from './EstimatePanel';
import ConfirmModal from './ConfirmModal';
import { TIER_ANCHORS } from './calculatorData';
import './calculator.css';

const newSystem = (id: number): SystemState => ({
  id: id,
  sysType: 'ducted',
  brand: 'acpro',
  tier: 'standard',
  tons: 5,
  addons: {},
  notes: '',
  miniId: 'acpro_12k',
  multiCondenserId: '',
  multiHeads: {},
  heads: [{ id: 1, type: 'wall', btu: '12k', name: '' }],
});

const defaultProject: ProjectState = {
  tier: 4,
  anchor: 16500,
  addons: {},
  builder: 'Mid Construction Group',
  address: '',
  quoteNumber: '',
  quoteDate: '',
  quoteExpiry: '',
  confirmedOnce: false,
  revisedFrom: '',
};

export default function Calculator() {
  const [project, setProject] = useState<ProjectState>(defaultProject);
  const [systems, setSystems] = useState<SystemState[]>([newSystem(1)]);
  const [nextSysId, setNextSysId] = useState(2);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const quoteDate = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    setProject(prev => ({
      ...prev,
      quoteNumber: `RA-${Math.floor(100000 + Math.random() * 900000)}`,
      quoteDate: quoteDate.toLocaleDateString('en-US', dateOptions),
      quoteExpiry: expiry.toLocaleDateString('en-US', dateOptions),
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
    const quoteDate = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    setProject({
      ...defaultProject,
      quoteNumber: `RA-${Math.floor(100000 + Math.random() * 900000)}`,
      quoteDate: quoteDate.toLocaleDateString('en-US', dateOptions),
      quoteExpiry: expiry.toLocaleDateString('en-US', dateOptions),
    });
    setSystems([newSystem(Date.now())]);
    setNextSysId(Date.now() + 1);
  };

  const anyDuctless = systems.some(s => s.sysType === 'mini' || s.sysType === 'multi');
  const anyConcealed = false;
  const showDuctlessIncludes = anyDuctless && !anyConcealed;

  return (
    <div id="appWrap">
      <div className="preview-ribbon" aria-hidden="true"><span>Preview</span></div>
      <div className="wrap">
        <header>
          <div className="brand">
          <img src="/logo.png" alt="Rhino Air" className="logo-img" />
          <div className="brand-text">
            <div className="tag">Single Family · Residential New Construction · HVAC</div>
            <h1>Installation Estimate</h1>
            <div className="subtag">For General Contractors &amp; Developers</div>
          </div>
        </div>
          <div className="contacts">
            <div className="contact-block">
              <div className="c-name">Sam Yaghobi</div>
              <a href="mailto:sam.yaghobi@rhinoair.com">sam.yaghobi@rhinoair.com</a>
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
                <input
                  id="builderName"
                  className="locked-input"
                  type="text"
                  readOnly
                  value={project.builder}
                />
              </div>
              <div className="proj-field">
                <label htmlFor="projAddress">Project address</label>
                <input
                  id="projAddress"
                  type="text"
                  placeholder="e.g. 1234 Oak Street, Los Angeles, CA 90001"
                  value={project.address}
                  onChange={e => setProject({ ...project, address: e.target.value })}
                />
              </div>
            </div>

            <div className="block" id="volumeBlock">
              <div className="section-label">Project Volume</div>
              <div className="tier-grid passive" id="volumeTier">
                {[1, 2, 3, 4].map(tier => (
                  <div key={tier} className={`opt tier ${project.tier === tier ? 'active' : ''}`} data-tier={tier}>
                    <span className="tier-badge">Your tier</span>
                    <div className="ttl">Tier {tier}</div>
                    <div className="tier-range">
                      {tier === 1 ? '1–3 projects' : tier === 2 ? '4–9 projects' : tier === 3 ? '10–15 projects' : '15+ projects'}
                    </div>
                    <div className="tier-anchor">
                      ${TIER_ANCHORS[tier].toLocaleString('en-US')} <span style={{ opacity: 0.6 }}>/ ducted 5-ton</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="included-note">
                <b>Volume pricing:</b> higher project volume lowers the base price per system. Your tier applies to every system in this project, including mini-split &amp; multi-split. Prices shown are the ducted central 5-ton reference. <i>One project = one single-family residential house.</i>
              </div>
            </div>

            <div className="block">
              <div className="section-label">Systems</div>
              <div className="included-note" id="includesDucted" style={{ display: showDuctlessIncludes ? 'none' : 'block', marginTop: 0, marginBottom: 16 }}>
                <b>Base price includes (per system):</b>
                <ul className="includes-list">
                  <li><b>Heat Pump System</b> (Goodman, AC Pro, or Daikin)</li>
                  <li>R-6 Flex Insulated Ducting</li>
                  <li>One standard thermostat</li>
                  <li>Single Zone System</li>
                  <li>Standard diffusers &amp; air grills</li>
                  <li>Ductwork, line set &amp; startup</li>
                  <li>Low-voltage wiring</li>
                  <li>Drain line, drain pan &amp; condenser pad</li>
                  <li className="includes-warranty"><b>1-Year Labor Warranty</b> · <b>Manufacturer Warranty</b> (10-yr Goodman / AC Pro · 12-yr Daikin)</li>
                </ul>
              </div>
              <div className="included-note" id="includesDuctless" style={{ display: showDuctlessIncludes ? 'block' : 'none', marginTop: 0, marginBottom: 16 }}>
                <b>Base price includes (per system):</b>
                <ul className="includes-list">
                  <li><b>Inverter Condenser</b> (Goodman, AC Pro, or Daikin)</li>
                  <li>Indoor head(s) — wall, cassette or concealed</li>
                  <li>Wireless remote / controller per zone</li>
                  <li>Line set, refrigerant &amp; startup</li>
                  <li>Condensate drain &amp; pump (as needed)</li>
                  <li>Low-voltage wiring</li>
                  <li>Wall sleeve &amp; mounting hardware</li>
                  <li>Condenser pad or wall bracket</li>
                  <li className="includes-warranty"><b>1-Year Labor Warranty</b> · <b>Manufacturer Warranty</b> (10-yr Goodman / AC Pro · 12-yr Daikin)</li>
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
                    onChange={sys => handleSystemChange(i, sys)}
                    onRemove={() => removeSystem(i)}
                  />
                ))}
              </div>

              <button type="button" className="add-system-btn" id="addSystemBtn" onClick={addSystem}>
                + Add another system
              </button>
            </div>

            <div className="block">
              <div className="section-label">Project Add-Ons</div>
              <div className="proj-addons-note">Counted once per house — except where marked per system</div>
              <ProjectAddons project={project} onChange={setProject} />
            </div>
          </div>

          <EstimatePanel project={project} systems={systems} onOpenConfirm={() => setShowConfirm(true)} onReset={handleReset} />
        </div>
      </div>

      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        project={project}
        systems={systems}
        onConfirm={() => setProject({ ...project, confirmedOnce: true })}
        onPrint={() => {
          const btn = document.getElementById('panelPrintBtn') as HTMLButtonElement | null;
          btn?.click();
        }}
      />
      <div id="printDoc" aria-hidden="true"></div>
    </div>
  );
}
