import React, { useState } from 'react';
import { ProjectState, SystemState, baseForSystem, systemSubtotal, addonLineTotal } from './calculatorUtils';
import { BRANDS, BRAND_EFF, MULTI_CONDENSER, MINI_SETS, SYSTEM_ADDON_DEFS, PROJECT_ADDON_DEFS } from './calculatorData';

interface ConfirmModalProps {
  show: boolean;
  onClose: () => void;
  project: ProjectState;
  systems: SystemState[];
  onConfirm: () => void;
}

export default function ConfirmModal({ show, onClose, project, systems, onConfirm }: ConfirmModalProps) {
  const [submitted, setSubmitted] = useState(false);

  if (!show) return null;

  const formatPrice = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

  const getBrand = (sys: SystemState) => BRANDS.find(b => b.id === sys.brand) || BRANDS[0];

  const buildLinesForSystem = (s: SystemState) => {
    const lines: { item: string; amount: number }[] = [];
    const base = baseForSystem(s, project);
    const brand = getBrand(s);

    if (s.sysType === 'mini') {
      const mSet = MINI_SETS.find(m => m.id === s.miniId);
      lines.push({ item: `${brand.name} ${mSet?.name || 'Mini-Split'} system`, amount: base });
    } else if (s.sysType === 'multi') {
      const c = MULTI_CONDENSER.find(x => x.id === s.multiCondenserId);
      const headsCount = Object.values(s.multiHeads || {}).reduce((sum, qty) => sum + qty, 0);
      lines.push({ item: `${brand.name} Multi-Split system (${c?.name} · ${headsCount} heads)`, amount: base });
    } else {
      lines.push({ item: `${brand.name} ${s.tons}-ton base`, amount: base });
      const effLevels = BRAND_EFF[s.brand] || BRAND_EFF.goodman;
      const eff = effLevels.find(t => t.id === s.tier) || effLevels[0];
      if (eff && eff.delta > 0) {
        lines.push({ item: `${eff.name} efficiency upgrade (${eff.desc})`, amount: eff.delta });
      }
      if (s.zoned) {
        const z = Math.max(s.zoneCount || 2, 2);
        const zc = 3100 + Math.max(z - 2, 0) * 1500;
        const addlTxt = z > 2 ? ` + ${z - 2}×$1,500` : '';
        lines.push({ item: `Multi-Zone Damper System (${z} zones · $3,100${addlTxt})`, amount: zc });
      }
    }

    SYSTEM_ADDON_DEFS.forEach(def => {
      const a = s.addons[def.id];
      if (!a || !a.on) return;
      if (s.sysType !== 'ducted' && ['furnace', 'curb', 'hers', 'hersfinal'].includes(def.id)) return;
      if (def.group === 'airquality' && s.sysType !== 'ducted') return;
      
      let sl = '';
      if (def.type === 'qty') {
        const q = a.qty || def.min || 1;
        sl = `${q} ${def.unit}`;
      } else if (def.type === 'radiogroup') {
        sl = a.segTier || def.segs?.[0]?.tier || '';
      } else if (def.type === 'multirow' && a.rows) {
        sl = def.rows?.filter(r => (a.rows?.[r.key] || 0) > 0).map(r => `${a.rows![r.key]}× ${r.label}`).join(', ') || '';
      }

      const lt = addonLineTotal(def, a, systems.length);
      lines.push({ item: def.name + (sl ? ` (${sl})` : ''), amount: lt });
    });

    return lines;
  };

  const projLines = PROJECT_ADDON_DEFS.reduce((acc, def) => {
    const a = project.addons[def.id];
    if (a && a.on) {
      const lt = addonLineTotal(def, a, systems.length);
      if (lt > 0 || def.type !== 'multirow') {
        let sl = '';
        if (def.type === 'qty') sl = `${a.qty || def.min || 1} ${def.unit}`;
        acc.push({ item: def.name + (sl ? ` (${sl})` : ''), amount: lt });
      }
    }
    return acc;
  }, [] as { item: string; amount: number }[]);

  let grand = 0;

  const handleSubmit = () => {
    onConfirm();
    setSubmitted(true);
  };

  const handleEdit = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className={`modal-overlay show`} id="confirmModal" onClick={(e) => { if (e.target === e.currentTarget && !submitted) onClose(); }}>
      <div className="modal-box">
        <button type="button" className="modal-close" onClick={onClose} id="modalCloseBtn" style={{ display: submitted ? 'none' : 'block' }} aria-label="Close">✕</button>
        
        {/* Review Form View */}
        <div id="confirmCard" className={`confirm-card ${submitted ? 'hidden' : ''}`}>
          <div className="modal-title">Confirm &amp; Submit Quote</div>
          <p className="confirm-intro">Please review the details below before submitting. Once confirmed, this quote will be sent to Rhino Air.</p>
          <div className="modal-quote-ref" id="modalQuoteRef">
            Quote {project.quoteNumber} · {formatPrice(systems.reduce((acc, s) => acc + systemSubtotal(s, project, systems.length), 0) + projLines.reduce((acc, l) => acc + l.amount, 0))}
          </div>

          <div id="confirmReview" className="confirm-review">
            {systems.map((s, i) => {
              const sub = systemSubtotal(s, project, systems.length);
              grand += sub;
              const brand = getBrand(s);
              const typeLabel = s.sysType === 'mini' ? 'Mini-Split' : s.sysType === 'multi' ? 'Multi-Split' : `${s.tons} ton`;
              const effLevels = BRAND_EFF[s.brand] || BRAND_EFF.goodman;
              const series = s.sysType === 'ducted' ? ` · ${(effLevels.find(t => t.id === s.tier) || effLevels[0])?.series}` : '';

              return (
                <div className="cr-sys" key={s.id}>
                  <div className="cr-sys-head">
                    <div className="cr-sys-name">
                      System {i + 1} {s.name ? `· ${s.name}` : ''}
                      <small>{brand.name} · {typeLabel}{series}</small>
                    </div>
                    <div className="cr-sys-sub">{formatPrice(sub)}</div>
                  </div>
                  {buildLinesForSystem(s).map((l, j) => (
                    <div className="cr-line" key={j}>
                      <span>{l.item}</span>
                      <span className="cr-l-amt">{formatPrice(l.amount)}</span>
                    </div>
                  ))}
                  {s.notes && <div className="cr-note">Note: {s.notes}</div>}
                </div>
              );
            })}

            {projLines.length > 0 && (
              <div className="cr-sys">
                <div className="cr-sys-head">
                  <div className="cr-sys-name">Project Add-Ons<small>per house</small></div>
                  <div className="cr-sys-sub">{formatPrice(projLines.reduce((acc, l) => acc + l.amount, 0))}</div>
                </div>
                {projLines.map((l, j) => {
                  grand += l.amount;
                  return (
                    <div className="cr-line" key={j}>
                      <span>{l.item}</span>
                      <span className="cr-l-amt">{formatPrice(l.amount)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="cr-total">
              <span className="cr-t-label">Project Total</span>
              <span className="cr-t-val">{formatPrice(grand)}</span>
            </div>
          </div>

          <button type="button" className="btn btn-primary confirm-submit" onClick={handleSubmit} id="confirmSubmitBtn">Confirm &amp; Submit Quote</button>
        </div>

        {/* Success View */}
        <div id="confirmSuccess" className={`confirm-success ${submitted ? 'show' : ''}`}>
          <div className="cs-check">✓</div>
          <div className="cs-title">Quote Submitted</div>
          <div className="cs-msg">
            Thank you. Quote <span className="cs-qnum" id="csQuoteNum">{project.quoteNumber}</span> for <span id="csBuilder">{project.builder || '—'}</span> has been confirmed. A Rhino Air representative will follow up shortly.
            <br />
            <span className="cs-valid" id="csValid" style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12 }}>
              {project.quoteExpiry ? `Pricing valid through ${project.quoteExpiry}.` : 'Valid 30 days.'}
            </span>
          </div>
          <div className="cs-revised" id="csRevised">{project.revisedFrom}</div>
          <div className="cs-actions">
            <button type="button" className="btn btn-primary" onClick={() => window.print()} id="printConfirmBtn">Print / Save Confirmation</button>
            <button type="button" className="btn btn-ghost" onClick={handleEdit} id="confirmEditBtn">Edit Quote</button>
          </div>
        </div>
      </div>
    </div>
  );
}
