import { useState, useEffect, useRef, Fragment } from 'react';
import { useLSC } from './context.js';

export function Emblem({ size = 56, ring = true, stroke = 1.4 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
         style={{ display: "block", color: "var(--lsc-bone)" }} aria-hidden="true">
      {ring && <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth={stroke} opacity="0.95" />}
      {ring && <circle cx="50" cy="50" r="41.5" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />}
      <path d="M30 62 L34 41 L41.5 53 L50 36 L58.5 53 L66 41 L70 62 Z"
            stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" fill="none" />
      <path d="M30 62 L70 62" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      <path d="M30 67 L70 67" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      <circle cx="34" cy="40" r="1.7" fill="currentColor" />
      <circle cx="50" cy="34.5" r="2" fill="currentColor" />
      <circle cx="66" cy="40" r="1.7" fill="currentColor" />
    </svg>
  );
}

export function Logo({ variant = "inline", wordSize = 19, emblemSize = 38 }) {
  if (variant === "stack") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <Emblem size={emblemSize} stroke={1.3} />
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div className="lsc-word" style={{ fontSize: wordSize }}>La&nbsp;Sacra<br/>Corona</div>
        </div>
      </div>
    );
  }
  return (
    <a href="#top" style={{ display: "inline-flex", alignItems: "center", gap: 13 }} aria-label="La Sacra Corona — inicio">
      <Emblem size={emblemSize} stroke={1.5} />
      <span className="lsc-word" style={{ fontSize: wordSize, whiteSpace: "nowrap" }}>La&nbsp;Sacra&nbsp;Corona</span>
    </a>
  );
}

export function Stars({ size = 14 }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label="4,9 de 5">
      {"★★★★★"}
    </span>
  );
}

export function Reveal({ children, delay = 0, y = 22, as = "div", className = "", style = {} }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(true); return; }
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setShown(true);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
    const check = () => {
      if (done) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      if (r.top < vh * 0.92 && r.bottom > 0) reveal();
    };
    const raf = requestAnimationFrame(check);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    const to = setTimeout(reveal, 2200);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(to);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} className={className}
         style={{
           ...style,
           opacity: shown ? 1 : 0,
           transform: shown ? "translateY(0)" : `translateY(${y}px)`,
           transition: `opacity 1100ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1100ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
         }}>
      {children}
    </Tag>
  );
}

export function SectionHead({ idx, eyebrow, title, lede, action }) {
  return (
    <div className="section-head">
      <div className="left">
        <Reveal>
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            <span className="tick">[{idx}]</span> {eyebrow}
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="sect-title" style={{ marginBottom: lede ? 20 : 0 }}>{title}</h2>
        </Reveal>
        {lede && <Reveal delay={140}><p className="lede">{lede}</p></Reveal>}
      </div>
      {action && <Reveal delay={120} style={{ flexShrink: 0 }}>{action}</Reveal>}
    </div>
  );
}

export function TrustStrip({ compact = false }) {
  const { c, data } = useLSC();
  const items = [
    { n: <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{data.rating}<Stars size={13} /></span>, l: c.trust.rating },
    { n: data.reviews, l: c.trust.reviews },
    { n: data.years, l: c.trust.years },
    { n: data.studios, l: c.trust.studios },
  ];
  return (
    <div className="trust-strip" style={compact ? { gap: 28 } : {}}>
      {items.map((it, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="trust-sep" />}
          <div className="trust-item">
            <span className="n">{it.n}</span>
            <span className="l">{it.l}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
