import React from 'react';
import { SystemState, AddonState, ProjectState, isDuctless, systemSubtotal, sysDisplayName, sysSummary, brandOf } from './calculatorUtils';
import { BRANDS, BRAND_EFF, MINI_SETS, MULTI_CONDENSER, HEAD_BTU, TON_OPTS, SYSTEM_ADDON_DEFS, SYS_TYPES, ZONE_FIRST, ZONE_ADDL, NEST_RATE } from './calculatorData';
import AddonItem from './AddonItem';
import { brandLogoSvg } from './calculatorLogos';

interface SystemCardProps {
  system: SystemState;
  index: number;
  project: ProjectState;
  systemsLength: number;
  onChange: (sys: SystemState) => void;
  onRemove?: () => void;
}

export default function SystemCard({ system, index, project, systemsLength, onChange, onRemove }: SystemCardProps) {
  const update = (changes: Partial<SystemState>) => onChange({ ...system, ...changes });

  const formatPrice = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

  // --- Header ---
  const dispName = sysDisplayName(system, index);
  const summary = sysSummary(system);
  const lineTotal = systemSubtotal(system, project, systemsLength);
  const removable = systemsLength > 1;

  const handleToggleCollapse = (e: React.MouseEvent) => {
    // Only toggle if clicked on the header directly, not inputs/buttons
    if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'INPUT') {
      update({ collapsed: !system.collapsed });
    }
  };

  // --- Type Selector ---
  const types = SYS_TYPES;

  // --- Brand Selector ---
  const brandOpts = BRANDS.filter(b => {
    if(system.sysType === 'mini') return b.mini;
    if(system.sysType === 'multi') return b.multi;
    return b.ducted;
  });

  // --- Efficiency Selector (Ducted) ---
  const activeBrand = BRANDS.find(b => b.id === system.brand);
  const tiers = BRAND_EFF[system.brand] || BRAND_EFF.goodman;

  // --- Addons ---
  const handleAddonChange = (addonId: string, val: AddonState) => {
    update({ addons: { ...system.addons, [addonId]: val } });
  };

  const ductless = isDuctless(system);
  const hideForDuctless = new Set(['furnace','curb','hers','hersfinal']);
  const COMMON_ADDONS = new Set(['furnace','crane']);
  const MORE_ADDONS = ['coastal','curb','hers','hersfinal'];

  const visibleNonIaq = SYSTEM_ADDON_DEFS.filter(d => d.group !== 'airquality' && !(ductless && hideForDuctless.has(d.id)));
  const commonDefs = visibleNonIaq.filter(d => COMMON_ADDONS.has(d.id));
  const moreDefs = visibleNonIaq.filter(d => MORE_ADDONS.includes(d.id));
  const moreSel = moreDefs.filter(d => system.addons[d.id]?.on).length;
  const iaqDefs = SYSTEM_ADDON_DEFS.filter(d => d.group === 'airquality');
  const iaqSel = iaqDefs.filter(d => system.addons[d.id]?.on).length;

  // --- Sub-components ---
  const renderZoneConfig = () => {
    const single = !system.zoned;
    const nestOk = brandOf(system).nest;
    const z = Math.max(system.zoneCount || 2, 2);
    const multiZoneCost = ZONE_FIRST + Math.max(z - 1, 0) * ZONE_ADDL + ((nestOk && system.multiNest) ? NEST_RATE * z : 0);

    return (
      <div className="zone-mode">
        <div className="zm-label">Zone configuration</div>
        <div className="zone-seg-row">
          <button type="button" className={`zone-seg ${single ? 'active' : ''}`} onClick={() => update({ zoned: false })}>
            <div className="zs-ttl">Single Zone</div>
            <div className="zs-sub">included in base</div>
          </button>
          <button type="button" className={`zone-seg ${!single ? 'active' : ''}`} onClick={() => update({ zoned: true })}>
            <div className="zs-ttl">Multi-Zone Damper System</div>
            <div className="zs-sub">from $3,100 (2 zones)</div>
          </button>
        </div>

        <div className={`zone-panel zone-single ${single ? '' : 'hidden'}`}>
          {nestOk && (
            <div className={`addon ${system.singleNest ? 'on' : ''}`}>
              <div className="addon-head">
                <div className="addon-info">
                  <div className="name">Google Nest (4th Gen) or Equal</div>
                  <div className="desc">High-end smart thermostat upgrade from the included standard thermostat (1 per system).</div>
                </div>
                <span className="addon-price-tag">${NEST_RATE}</span>
                <label className="switch">
                  <input type="checkbox" checked={!!system.singleNest} onChange={e => update({ singleNest: e.target.checked })} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className={`zone-panel zone-multi ${single ? 'hidden' : ''}`}>
          <div className="addon on" data-zonemulti="1">
            <div className="addon-head">
              <div className="addon-info">
                <div className="name">Multi-Zone Damper System</div>
                <div className="desc">First 2 zones $3,100, then $600 per additional zone (standard thermostats included).</div>
              </div>
              <span className="addon-price-tag">from $3,100 + $600/zone</span>
            </div>
            <div className="qty-area">
              <span className="qty-label">Number of zones</span>
              <div className="stepper zones-step">
                <button type="button" className="dec" onClick={() => update({ zoneCount: Math.max((system.zoneCount || 2) - 1, 2) })}>−</button>
                <input type="number" className="zones-input qty" value={z} min="2" onChange={e => update({ zoneCount: Math.max(parseInt(e.target.value) || 2, 2) })} />
                <button type="button" className="inc" onClick={() => update({ zoneCount: (system.zoneCount || 2) + 1 })}>+</button>
              </div>
              <span className="qty-line-total zones-total">{formatPrice(multiZoneCost)}</span>
            </div>
            {nestOk && (
              <div className="nest-sub">
                <div className="nest-sub-info">
                  <div className="nest-sub-label">Upgrade to Google Nest (4th Gen) or Equal thermostats?</div>
                  <div className="nest-sub-hint">${NEST_RATE} per zone · 1 per zone (replaces standard)</div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={!!system.multiNest} onChange={e => update({ multiNest: e.target.checked })} />
                  <span className="slider"></span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMiniBuilder = () => {
    const opts = MINI_SETS.filter(m => m.brand === system.brand);
    if (!opts.length) return null;
    return (
      <>
        <div className="sub-label">System capacity</div>
        <div className="minihead-row">
          {opts.map(m => (
            <button key={m.id} type="button" className={`minihead-seg ${system.miniId === m.id ? 'active' : ''}`} onClick={() => update({ miniId: m.id })}>
              <span>{m.name}</span>
              <span className="mh-add">{formatPrice(m.price)}</span>
            </button>
          ))}
        </div>
      </>
    );
  };

  const renderMultiBuilder = () => {
    const b = activeBrand;
    if (!b || !b.multi) return <div className="muted">Multi-split not available for this brand.</div>;
    const headRate = b.multiCondRate || 0;
    const rateTxt = headRate > 0 ? `$${headRate.toLocaleString('en-US')} ea` : 'Price TBD';
    return (
      <>
        <div className="sub-label">Condenser capacity</div>
        <div>
          {MULTI_CONDENSER.filter(c => c.brand === system.brand).map(c => (
            <button key={c.id} type="button" className={`cond-row ${system.multiCondenserId === c.id ? 'active' : ''}`} onClick={() => update({ multiCondenserId: c.id })}>
              <div className="cond-info">
                <div className="cond-name">{c.name}</div>
                <div className="cond-sub">{c.ports} ports · up to {Math.round(c.max / 1000)}k BTU</div>
              </div>
              <span className="cond-price-sm">{formatPrice(c.price)}</span>
            </button>
          ))}
        </div>
        <div className="heads-head">
          <div className="sub-label">Indoor heads</div>
        </div>
        <div className="heads-list">
          {HEAD_BTU.map(h => {
            const qty = system.multiHeads?.[h.id] || 0;
            return (
              <div key={h.id} className="head-row">
                <div className="head-row-top">
                  <div className="head-label">{h.name}</div>
                  <div className="head-row-right">
                    <span className="head-price">{formatPrice(qty * headRate)}</span>
                  </div>
                </div>
                <div className="stepper mr-step">
                  <button type="button" className="dec" onClick={() => update({ multiHeads: { ...system.multiHeads, [h.id]: Math.max(qty - 1, 0) } })}>−</button>
                  <input type="number" className="qty" value={qty} min="0" onChange={e => update({ multiHeads: { ...system.multiHeads, [h.id]: Math.max(parseInt(e.target.value)||0, 0) } })} />
                  <button type="button" className="inc" onClick={() => update({ multiHeads: { ...system.multiHeads, [h.id]: qty + 1 } })}>+</button>
                </div>
                <div className="cond-info"><div className="cond-sub">{rateTxt}</div></div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className={`system-card ${system.collapsed ? 'collapsed' : ''}`} data-sysid={system.id}>
      <div className="sys-head" onClick={handleToggleCollapse} style={{ cursor: 'pointer' }}>
        <div className="sys-badge">{index + 1}</div>
        <div className="sys-headline">
          <div className="sys-name">{dispName}</div>
          <div className="sys-meta">{summary}</div>
        </div>
        <span className="sys-subtotal">{formatPrice(lineTotal)}</span>
        {removable && <button className="sys-remove" title="Remove system" onClick={e => { e.stopPropagation(); onRemove && onRemove(); }}>✕</button>}
        <span className="sys-chevron">▼</span>
      </div>

      <div className="sys-body">
        <div className="sub-label">System name (optional)</div>
        <input type="text" className="sys-name-input" placeholder="e.g. Master Bedroom, Downstairs, Unit A" value={system.name || ''} onChange={e => update({ name: e.target.value })} />

        <div className="sub-label">System type</div>
        <div className="systype-row">
          {types.map(t => (
            <button key={t.id} type="button" className={`systype-seg ${system.sysType === t.id ? 'active' : ''}`} onClick={() => update({ sysType: t.id as any })}>
              <div className="st-ic">{t.icon}</div>
              <div className="st-name">{t.name}</div>
              <div className="st-sub">{t.sub}</div>
            </button>
          ))}
        </div>

        <div className="sub-label">Brand</div>
        <div className="brand-seg-row">
          {brandOpts.map(b => (
            <button key={b.id} type="button" className={`brand-seg ${system.brand === b.id ? 'active' : ''}`} onClick={() => update({ brand: b.id })}>
              <span className="bs-logo-chip" dangerouslySetInnerHTML={{ __html: brandLogoSvg(b.id) }} style={{ pointerEvents: 'none' }} />
            </button>
          ))}
        </div>

        {system.sysType === 'ducted' && (
          <>
            <div className="sub-label">Efficiency</div>
            <div className="eff-seg-row">
              {tiers.map(t => (
                <button key={t.id} type="button" className={`eff-seg ${system.tier === t.id ? 'active' : ''}`} onClick={() => update({ tier: t.id })}>
                  <div className="es-series">{t.series}</div>
                  <div className="es-name">{t.label || t.name}</div>
                  <div className="es-seer">{t.seer2 || t.desc}</div>
                  <div className="es-price">{t.delta ? `+${formatPrice(t.delta)}` : 'Included'}</div>
                  {!!t.features?.length && (
                    <ul className="es-feats">
                      {t.features.map((feature: string) => <li key={feature}>{feature}</li>)}
                    </ul>
                  )}
                </button>
              ))}
            </div>

            <div className="sub-label">System size (tonnage)</div>
            <div className="ton-grid">
              {TON_OPTS.map(o => (
                <button key={o.ton} type="button" className={`opt ton ${system.tons === o.ton ? 'active' : ''}`} onClick={() => update({ tons: o.ton })}>
                  <div className="ttl">{o.ton} ton</div>
                  {o.sub && <div className="sub">{o.sub}</div>}
                  <div className="price-hint">−{formatPrice(o.down * 1500)}</div>
                </button>
              ))}
            </div>

            <div className="sub-label">Options & additions</div>
            {renderZoneConfig()}
          </>
        )}

        {system.sysType === 'mini' && renderMiniBuilder()}
        {system.sysType === 'multi' && renderMultiBuilder()}

        {(system.sysType === 'mini' || system.sysType === 'multi') && (
          <div className="sub-label">Options & additions</div>
        )}

        {/* Common Addons */}
        {commonDefs.map(def => (
          <AddonItem key={def.id} def={def} value={system.addons[def.id]} onChange={val => handleAddonChange(def.id, val)} sys={system} systemsLength={systemsLength} />
        ))}

        {/* More Addons Group */}
        {moreDefs.length > 0 && (
          <div className={`aq-group ${system.moreOpen ? 'open' : ''}`}>
            <button type="button" className="aq-head aq-head-more" onClick={() => update({ moreOpen: !system.moreOpen })}>
              <div className="aq-head-info">
                <div className="aq-title">More options</div>
                <div className="aq-sub">{moreSel ? `${moreSel} selected` : `${moreDefs.length} options`}</div>
              </div>
              <span className="aq-chev">▾</span>
            </button>
            <div className="aq-body">
              {moreDefs.map(def => (
                <AddonItem key={def.id} def={def} value={system.addons[def.id]} onChange={val => handleAddonChange(def.id, val)} sys={system} systemsLength={systemsLength} />
              ))}
            </div>
          </div>
        )}

        {/* Air Quality Group */}
        {!ductless && (
          <div className={`aq-group ${system.aqOpen ? 'open' : ''}`}>
            <button type="button" className="aq-head" onClick={() => update({ aqOpen: !system.aqOpen })}>
              <div className="aq-head-info">
                <div className="aq-title">Air Quality</div>
                <div className="aq-sub">{iaqSel ? `${iaqSel} selected` : `${iaqDefs.length} options`}</div>
              </div>
              <span className="aq-chev">▾</span>
            </button>
            <div className="aq-body">
              {iaqDefs.map(def => (
                <AddonItem key={def.id} def={def} value={system.addons[def.id]} onChange={val => handleAddonChange(def.id, val)} sys={system} systemsLength={systemsLength} />
              ))}
            </div>
          </div>
        )}

        <div className="sub-label">Notes (optional)</div>
        <textarea className="sys-notes" placeholder="Notes for this system — e.g. attic access tight, existing ductwork to remove…" value={system.notes || ''} onChange={e => update({ notes: e.target.value })}></textarea>
      </div>
    </div>
  );
}
