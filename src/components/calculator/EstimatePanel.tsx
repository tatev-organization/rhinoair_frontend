import React from 'react';
import { ProjectState, SystemState, AddonDef, AddonState, baseForSystem, systemSubtotal, isDuctless, sysDisplayName, addonLineTotal } from './calculatorUtils';
import { BRANDS, BRAND_EFF, MINI_SETS, MULTI_CONDENSER, SYSTEM_ADDON_DEFS, PROJECT_ADDON_DEFS } from './calculatorData';

interface EstimatePanelProps {
  project: ProjectState;
  systems: SystemState[];
  onOpenConfirm: () => void;
}

export default function EstimatePanel({ project, systems, onOpenConfirm }: EstimatePanelProps) {
  const formatPrice = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

  const addonSubline = (def: AddonDef, a: AddonState, s?: SystemState) => {
    if (def.type === 'qty') {
      const q = a.qty || def.min || 1;
      const b = def.base || 0;
      const f = def.free || 0;
      const r = def.rate || 0;
      if (b > 0) return `${q} ${def.unit} · $${b} + ${Math.max(q - f, 0)}×$${r}`;
      return `${q} ${def.unit} × $${r}`;
    }
    if (def.type === 'perqty') {
      const q = a.qty || def.min || 1;
      return `${q} ${def.unit} × $${(def.rate||0).toLocaleString('en-US')}`;
    }
    if (def.type === 'radiogroup') {
      return a.segTier || def.segs?.[0]?.tier || '';
    }
    if (def.type === 'persystem') {
      const len = Math.max(systems.length, 1);
      return `${len} system${len !== 1 ? 's' : ''} × $${(def.rate||0).toLocaleString('en-US')}`;
    }
    if (def.type === 'multirow') {
      if (!a.rows) return '';
      return def.rows?.filter(r => (a.rows?.[r.key] || 0) > 0).map(r => `${a.rows![r.key]}× ${r.label}`).join(', ');
    }
    return '';
  };

  const getBrand = (sys: SystemState) => BRANDS.find(b => b.id === sys.brand) || BRANDS[0];
  const getEff = (sys: SystemState) => {
    const levels = BRAND_EFF[sys.brand] || BRAND_EFF.goodman;
    return levels.find(t => t.id === sys.tier) || levels[0];
  };
  const getMiniSet = (sys: SystemState) => MINI_SETS.find(m => m.id === sys.miniId);
  const getMultiCondenser = (sys: SystemState) => MULTI_CONDENSER.find(c => c.id === sys.multiCondenserId);

  let grand = 0;

  const renderSystemBlock = (s: SystemState, i: number) => {
    const base = baseForSystem(s, project);
    const sub = systemSubtotal(s, project, systems.length);
    grand += sub;

    const brand = getBrand(s);
    const rows: React.ReactNode[] = [];

    if (s.sysType === 'mini') {
      const mSet = getMiniSet(s);
      rows.push(
        <div className="est-sys-line" key="base">
          <span>{mSet?.name || 'Mini-split'} system</span>
          <span className="v">{formatPrice(base)}</span>
        </div>
      );
    } else if (s.sysType === 'multi') {
      const c = getMultiCondenser(s);
      const headsCount = Object.values(s.multiHeads || {}).reduce((sum, qty) => sum + qty, 0);
      rows.push(
        <div className="est-sys-line" key="base">
          <span>Multi-Split system · <span style={{ color: '#7d8e8b' }}>{c?.name || ''} · {headsCount} head{headsCount !== 1 ? 's' : ''}</span></span>
          <span className="v">{formatPrice(base)}</span>
        </div>
      );
    } else {
      const eff = getEff(s);
      rows.push(
        <div className="est-sys-line" key="base">
          <span>{s.tons}-ton base{s.tons === 2 ? ' (up to 2 ton)' : ''}</span>
          <span className="v">{formatPrice(base)}</span>
        </div>
      );
      if (eff && eff.delta > 0) {
        rows.push(
          <div className="est-sys-line" key="eff">
            <span>{eff.name} efficiency · <span style={{ color: '#7d8e8b' }}>{eff.desc}</span></span>
            <span className="v">{formatPrice(eff.delta)}</span>
          </div>
        );
      }
      if (s.zoned) {
        const z = Math.max(s.zoneCount || 2, 2);
        const zc = 3100 + Math.max(z - 2, 0) * 1500;
        const addlTxt = z > 2 ? ` + ${z - 2}×$1,500` : '';
        rows.push(
          <div className="est-sys-line" key="zone">
            <span>Multi-Zone Damper System · <span style={{ color: '#7d8e8b' }}>{z} zones · $3,100{addlTxt}</span></span>
            <span className="v">{formatPrice(zc)}</span>
          </div>
        );
      }
    }

    SYSTEM_ADDON_DEFS.forEach(def => {
      const a = s.addons[def.id];
      if (!a || !a.on) return;
      if (isDuctless(s) && ['furnace', 'curb', 'hers', 'hersfinal'].includes(def.id)) return;
      if (def.group === 'airquality' && isDuctless(s)) return;
      const lt = addonLineTotal(def, a, systems.length);
      const sl = addonSubline(def, a, s);
      rows.push(
        <div className="est-sys-line" key={def.id}>
          <span>{def.name}{sl ? <span> · <span style={{ color: '#7d8e8b' }}>{sl}</span></span> : ''}</span>
          <span className="v">{formatPrice(lt)}</span>
        </div>
      );
    });

    const typeDesc = s.sysType === 'mini' ? 'Mini-Split' : s.sysType === 'multi' ? 'Multi-Split' : `${s.tons} ton`;

    return (
      <div className="est-sys" key={s.id}>
        <div className="est-sys-head">
          <span className="esh-name">{sysDisplayName(s, i)} <small>· {brand.name} · {typeDesc}</small></span>
          <span className="esh-val">{formatPrice(sub)}</span>
        </div>
        {rows}
        {s.notes && s.notes.trim() && (
          <div className="est-sys-note">
            <span className="esn-label">Note:</span> {s.notes.trim()}
          </div>
        )}
      </div>
    );
  };

  const projTotal = PROJECT_ADDON_DEFS.reduce((sum, def) => {
    const a = project.addons[def.id];
    if (!a || !a.on) return sum;
    const lt = addonLineTotal(def, a, systems.length);
    if (lt <= 0 && def.type === 'multirow') return sum;
    return sum + lt;
  }, 0);

  grand += projTotal;

  return (
    <div className="estimate">
      <h2>Project Estimate</h2>
      <div className="quote-meta">
        <div className="qm-row">
          <span className="qm-label">Quote #</span>
          <span className="qm-val" id="quoteNumber">{project.quoteNumber || '—'}</span>
        </div>
        <div className="qm-row">
          <span className="qm-label">Date</span>
          <span className="qm-val" id="quoteDate">{project.quoteDate || '—'}</span>
        </div>
        <div className="qm-row">
          <span className="qm-label">Valid Until</span>
          <span className="qm-val" id="quoteExpiry">{project.quoteExpiry || '—'}</span>
        </div>
      </div>

      <div id="estTierLine" className="est-config">
        Tier {project.tier} · Heat Pump / Package
      </div>
      <div id="estBuilder" className={`est-address ${project.builder ? '' : 'empty'}`}>
        <span className="ea-label">Builder</span>
        {project.builder || '—'}
      </div>
      <div id="estAddress" className={`est-address ${project.address ? '' : 'empty'}`}>
        <span className="ea-label">Project address</span>
        {project.address || '—'}
      </div>

      <div id="estSystems">
        {systems.map((s, i) => renderSystemBlock(s, i))}
        {projTotal > 0 && (
          <div className="est-sys">
            <div className="est-sys-head">
              <span className="esh-name">Project Add-Ons <small>· per house</small></span>
              <span className="esh-val">{formatPrice(projTotal)}</span>
            </div>
            {PROJECT_ADDON_DEFS.map(def => {
              const a = project.addons[def.id];
              if (!a || !a.on) return null;
              const lt = addonLineTotal(def, a, systems.length);
              if (lt <= 0 && def.type === 'multirow') return null;
              const sl = addonSubline(def, a);
              return (
                <div className="est-sys-line" key={def.id}>
                  <span>{def.name}{sl ? <span> · <span style={{ color: '#7d8e8b' }}>{sl}</span></span> : ''}</span>
                  <span className="v">{formatPrice(lt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="est-total">
        <span className="tlabel">
          Project Total
          <small id="estSysCount">{systems.length === 1 ? '1 system' : `${systems.length} systems`}</small>
        </span>
        <span className="tval" id="grandTotal">{formatPrice(grand)}</span>
      </div>

      <div className="est-actions">
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
        <button type="button" className="btn btn-ghost" onClick={() => window.location.reload()}>Reset</button>
      </div>
      <button type="button" className="btn btn-confirm-open" id="openConfirmBtn" onClick={onOpenConfirm}>
        {project.confirmedOnce ? 'Edit / Re-submit Quote' : 'Confirm & Submit Quote'}
      </button>

      <div className="est-contact">
        <div className="ec-name">Sam Yaghobi</div>
        <a href="mailto:sam.yaghobi@rhinoair.com">sam.yaghobi@rhinoair.com</a>
        <a href="tel:+18189004007">(818) 900-4007</a>
        <div className="ec-office">Office (818) 535-8888 · info@rhinoair.com · Lic. C20-1142997 · OSHA 26-607683422</div>
      </div>
      <div className="partner-note">
        <b>Tier / Builder Partner Pricing</b>
        Selecting a tier does not by itself qualify a customer for that price. Tiered pricing applies only upon execution of a signed Builder Partnership Agreement confirming the committed project volume.
      </div>
      <div className="disclaimer" id="panelDisclaimer">
        Estimate only. Final pricing subject to site survey, permit fees &amp; local code requirements.
        {project.quoteExpiry ? ` Pricing valid through ${project.quoteExpiry}.` : ' Valid 30 days.'}
      </div>
    </div>
  );
}
