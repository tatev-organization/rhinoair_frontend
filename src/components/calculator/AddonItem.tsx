import React from "react";
import { AddonDef, AddonState, SystemState } from "./calculatorUtils";
import { isDuctless, addonLineTotal } from "./calculatorUtils";

interface AddonItemProps {
  def: AddonDef;
  value?: AddonState;
  onChange: (val: AddonState) => void;
  sys?: SystemState;
  systemsLength?: number;
}

export default function AddonItem({
  def,
  value,
  onChange,
  sys,
  systemsLength = 1,
}: AddonItemProps) {
  const a = value || { on: false };
  const on = !!a.on;
  const formatPrice = (n: number) =>
    "$" + Math.round(n).toLocaleString("en-US");

  const handleToggle = () => {
    onChange({ ...a, on: !a.on });
  };

  const handleSegClick = (rate: number, tier: string) => {
    onChange({ ...a, segRate: rate, segTier: tier });
  };

  const handleRowQtyChange = (key: string, qty: number) => {
    const newRows = { ...(a.rows || {}), [key]: qty };
    onChange({ ...a, rows: newRows });
  };

  const handleQtyChange = (qty: number) => {
    onChange({ ...a, qty });
  };

  let inner = null;
  if (def.type === "radiogroup") {
    const segs = def.segs?.map((sg, i) => {
      const act = on
        ? (a.segTier ? a.segTier === sg.tier : i === 0)
        : i === 0;
      return (
        <button
          key={i}
          type="button"
          className={`seg ${act ? "active" : ""}`}
          onClick={() => handleSegClick(sg.rate, sg.tier)}
        >
          <div className="seg-ttl">{sg.ttl}</div>
          <div className="seg-price">+${(sg.rate || 0).toLocaleString("en-US")}</div>
        </button>
      );
    });
    inner = (
      <div className={`seg-area ${on ? "" : "hidden"}`}>
        <div className="seg-label">Furnace efficiency</div>
        <div className="seg-row">{segs}</div>
      </div>
    );
  } else if (def.type === "multirow") {
    const rowsHtml = def.rows?.map((r) => {
      const q = a.rows && a.rows[r.key] ? a.rows[r.key] : 0;
      const rateTxt =
        r.rate > 0 ? "$" + r.rate.toLocaleString("en-US") + " ea" : "price TBD";
      return (
        <div className="mr-row" key={r.key}>
          <div className="mr-info">
            <div className="mr-label">{r.label}</div>
            <div className="mr-hint">{r.hint}</div>
          </div>
          <span className="mr-rate">{rateTxt}</span>
          <div className="stepper mr-step">
            <button
              type="button"
              className="dec"
              onClick={() => handleRowQtyChange(r.key, Math.max(q - 1, 0))}
            >
              −
            </button>
            <input
              type="number"
              className="qty"
              value={q}
              min="0"
              onChange={(e) =>
                handleRowQtyChange(
                  r.key,
                  Math.max(parseInt(e.target.value) || 0, 0),
                )
              }
            />
            <button
              type="button"
              className="inc"
              onClick={() => handleRowQtyChange(r.key, q + 1)}
            >
              +
            </button>
          </div>
          <span className="mr-linetotal">{formatPrice(q * r.rate)}</span>
        </div>
      );
    });
    inner = (
      <div className={`mr-area ${on ? "" : "hidden"}`}>
        {rowsHtml}
        <div className="mr-foot">
          <span className="mrf-label">Subtotal</span>
          <span className="mrf-val mr-subtotal">
            {formatPrice(addonLineTotal(def, { on: true, rows: a.rows || {} }))}
          </span>
        </div>
      </div>
    );
  } else if (def.type !== "flat" && def.type !== "persystem") {
    const minVal = def.min || 1;
    const q = a.qty || minVal;
    const lt = addonLineTotal(def, { ...a, on: true, qty: q }, systemsLength);
    inner = (
      <div className={`qty-area ${on ? "" : "hidden"}`}>
        <span className="qty-label">
          {def.unit === "zone"
            ? "Number of zones"
            : def.unit === "linear ft"
              ? "Linear feet"
              : "Quantity"}
        </span>
        <div className="stepper">
          <button
            type="button"
            className="dec"
            onClick={() => handleQtyChange(Math.max(q - 1, minVal))}
          >
            −
          </button>
          <input
            type="number"
            className="qty"
            value={q}
            min={minVal}
            onChange={(e) =>
              handleQtyChange(
                Math.max(parseInt(e.target.value) || minVal, minVal),
              )
            }
          />
          <button
            type="button"
            className="inc"
            onClick={() => handleQtyChange(q + 1)}
          >
            +
          </button>
        </div>
        <span className="qty-line-total">{formatPrice(lt)}</span>
      </div>
    );
  }

  const nameNote = def.note ? <span className="muted"> {def.note}</span> : null;
  const tagTxt =
    sys && isDuctless(sys) && def.ductlessRate != null
      ? `$${def.ductlessRate.toLocaleString("en-US")} / system`
      : def.type === "radiogroup" && def.segs?.length
        ? `from $${(def.segs[0].rate || 0).toLocaleString("en-US")}`
        : def.type === "multirow"
          ? def.tag
          : def.rate != null
            ? `$${def.rate.toLocaleString("en-US")} ${def.unit ? `per ${def.unit}` : def.tag ? def.tag.replace(/^[0-9$,]+\s*/, '') : ''}`
            : def.tag;

  return (
    <div className={`addon ${on ? "on" : ""}`}>
      <div
        className="addon-head"
        onClick={handleToggle}
        style={{ cursor: "pointer" }}
      >
        <div className="addon-info">
          <div className="name">
            {def.name}
            {nameNote}
          </div>
          <div className="desc">{def.desc}</div>
        </div>
        <span className="addon-price-tag">{tagTxt}</span>
        <label className="switch" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={on} onChange={handleToggle} />
          <span className="slider"></span>
        </label>
      </div>
      {inner}
    </div>
  );
}
