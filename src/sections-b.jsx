import { useState, useEffect, useMemo } from 'react';
import { useLSC } from './context.js';
import { Emblem, Stars, Reveal, SectionHead } from './components.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s().-]{7,}$/;

function useBooking() {
  const empty = { style: "", artist: "any", date: "", size: "", name: "", phone: "", email: "", idea: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const setField = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: null })); };

  const validate = (fields, c) => {
    const e = {};
    fields.forEach((k) => {
      const v = form[k];
      if (["name", "date", "style"].includes(k) && !v) e[k] = c.reservas.err_required;
      if (k === "email") { if (!v) e.email = c.reservas.err_required; else if (!EMAIL_RE.test(v)) e.email = c.reservas.err_email; }
      if (k === "phone") { if (!v) e.phone = c.reservas.err_required; else if (!PHONE_RE.test(v)) e.phone = c.reservas.err_phone; }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    setStatus("sending");
    setTimeout(() => setStatus("done"), 1100);
  };
  const reset = () => { setForm(empty); setErrors({}); setStatus("idle"); };

  return { form, setField, errors, status, validate, submit, reset };
}

function Field({ label, error, children }) {
  return (
    <label className={"field" + (error ? " has-error" : "")}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

function ArtistSelect({ value, onChange, anyLabel }) {
  const { data } = useLSC();
  return (
    <div className="chip-row">
      <button type="button" className={"chip" + (value === "any" ? " active" : "")} onClick={() => onChange("any")}>{anyLabel}</button>
      {data.artists.map((a) => (
        <button type="button" key={a.id} className={"chip" + (value === a.id ? " active" : "")} onClick={() => onChange(a.id)}>{a.name}</button>
      ))}
    </div>
  );
}

function StyleSelect({ value, onChange }) {
  const { c, data } = useLSC();
  return (
    <div className="style-grid">
      {data.styleKeys.map((k) => (
        <button type="button" key={k} className={"style-pick" + (value === k ? " active" : "")} onClick={() => onChange(k)}>
          <span className={"style-pick-img ph " + data.styleDuo[k]}></span>
          <span className="style-pick-name">{c.estilos.items[k].name}</span>
        </button>
      ))}
    </div>
  );
}

function SizeSelect({ value, onChange }) {
  const { c } = useLSC();
  return (
    <div className="chip-row">
      {c.reservas.sizes.map((s, i) => (
        <button type="button" key={i} className={"chip" + (value === s ? " active" : "")} onClick={() => onChange(s)}>{s}</button>
      ))}
    </div>
  );
}

function BookingSuccess({ onReset }) {
  const { c } = useLSC();
  return (
    <div className="booking-done">
      <Emblem size={56} stroke={1.3} />
      <h3 className="sect-title" style={{ fontSize: 34 }}>{c.reservas.done_title}</h3>
      <p className="lede">{c.reservas.done_body}</p>
      <button className="btn btn-outline" onClick={onReset}>{c.reservas.done_cta}<span className="arr">→</span></button>
    </div>
  );
}

function ReservasWizard({ bk }) {
  const { c } = useLSC();
  const [step, setStep] = useState(0);
  const steps = c.reservas.steps;

  const next = () => {
    const gates = [["style"], [], ["date"], ["name", "phone", "email"]];
    if (bk.validate(gates[step], c)) {
      if (step < 3) setStep(step + 1);
      else bk.submit();
    }
  };

  if (bk.status === "done") return <div className="booking-card"><BookingSuccess onReset={() => { bk.reset(); setStep(0); }} /></div>;

  return (
    <div className="booking-card">
      <div className="wizard-head">
        <span className="eyebrow"><span className="tick">{c.reservas.stepLabel} {step + 1}</span> {c.reservas.of} 4</span>
        <div className="wizard-dots">
          {steps.map((s, i) => (
            <span key={i} className={"wdot" + (i === step ? " active" : "") + (i < step ? " done" : "")}>
              <i></i>{s}
            </span>
          ))}
        </div>
      </div>

      <div className="wizard-body">
        {step === 0 && (
          <div className="wstep">
            <h3 className="wq">{c.reservas.q_style}</h3>
            <StyleSelect value={bk.form.style} onChange={(v) => bk.setField("style", v)} />
            {bk.errors.style && <span className="field-error">{bk.errors.style}</span>}
          </div>
        )}
        {step === 1 && (
          <div className="wstep">
            <h3 className="wq">{c.reservas.q_artist}</h3>
            <ArtistSelect value={bk.form.artist} onChange={(v) => bk.setField("artist", v)} anyLabel={c.reservas.q_artist_any} />
          </div>
        )}
        {step === 2 && (
          <div className="wstep">
            <h3 className="wq">{c.reservas.q_date}</h3>
            <Field label={c.reservas.q_date} error={bk.errors.date}>
              <input type="date" className="inp" value={bk.form.date} onChange={(e) => bk.setField("date", e.target.value)} />
            </Field>
            <div style={{ marginTop: 22 }}>
              <span className="field-label" style={{ display: "block", marginBottom: 12 }}>{c.reservas.q_size}</span>
              <SizeSelect value={bk.form.size} onChange={(v) => bk.setField("size", v)} />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="wstep form-2col">
            <Field label={c.reservas.f_name} error={bk.errors.name}>
              <input className="inp" value={bk.form.name} onChange={(e) => bk.setField("name", e.target.value)} />
            </Field>
            <Field label={c.reservas.f_phone} error={bk.errors.phone}>
              <input className="inp" value={bk.form.phone} onChange={(e) => bk.setField("phone", e.target.value)} placeholder="6XX XXX XXX" />
            </Field>
            <Field label={c.reservas.f_email} error={bk.errors.email}>
              <input className="inp" value={bk.form.email} onChange={(e) => bk.setField("email", e.target.value)} placeholder="tu@email.com" />
            </Field>
            <Field label={c.reservas.f_idea}>
              <textarea className="inp" rows="3" value={bk.form.idea} onChange={(e) => bk.setField("idea", e.target.value)} placeholder={c.reservas.f_idea_ph}></textarea>
            </Field>
          </div>
        )}
      </div>

      <div className="wizard-foot">
        <button className="btn btn-ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{ opacity: step === 0 ? 0.3 : 1 }}>
          ← {c.reservas.back}
        </button>
        <button className="btn btn-blood" onClick={next} disabled={bk.status === "sending"}>
          {step < 3 ? c.reservas.next : (bk.status === "sending" ? c.reservas.sending : c.reservas.submit)}
          <span className="arr">→</span>
        </button>
      </div>
    </div>
  );
}

function ReservasFicha({ bk }) {
  const { c } = useLSC();
  const onSubmit = (e) => {
    e.preventDefault();
    if (bk.validate(["style", "date", "name", "phone", "email"], c)) bk.submit();
  };
  if (bk.status === "done") return <div className="booking-card"><BookingSuccess onReset={bk.reset} /></div>;

  return (
    <form className="booking-card ficha" onSubmit={onSubmit}>
      <div className="ficha-block">
        <span className="field-label">{c.reservas.q_style}</span>
        <StyleSelect value={bk.form.style} onChange={(v) => bk.setField("style", v)} />
        {bk.errors.style && <span className="field-error">{bk.errors.style}</span>}
      </div>
      <div className="ficha-block">
        <span className="field-label">{c.reservas.q_artist}</span>
        <ArtistSelect value={bk.form.artist} onChange={(v) => bk.setField("artist", v)} anyLabel={c.reservas.q_artist_any} />
      </div>
      <div className="form-2col">
        <Field label={c.reservas.q_date} error={bk.errors.date}>
          <input type="date" className="inp" value={bk.form.date} onChange={(e) => bk.setField("date", e.target.value)} />
        </Field>
        <Field label={c.reservas.q_size}>
          <select className="inp" value={bk.form.size} onChange={(e) => bk.setField("size", e.target.value)}>
            <option value="">—</option>
            {c.reservas.sizes.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={c.reservas.f_name} error={bk.errors.name}>
          <input className="inp" value={bk.form.name} onChange={(e) => bk.setField("name", e.target.value)} />
        </Field>
        <Field label={c.reservas.f_phone} error={bk.errors.phone}>
          <input className="inp" value={bk.form.phone} onChange={(e) => bk.setField("phone", e.target.value)} placeholder="6XX XXX XXX" />
        </Field>
      </div>
      <Field label={c.reservas.f_email} error={bk.errors.email}>
        <input className="inp" value={bk.form.email} onChange={(e) => bk.setField("email", e.target.value)} placeholder="tu@email.com" />
      </Field>
      <Field label={c.reservas.f_idea}>
        <textarea className="inp" rows="3" value={bk.form.idea} onChange={(e) => bk.setField("idea", e.target.value)} placeholder={c.reservas.f_idea_ph}></textarea>
      </Field>
      <button type="submit" className="btn btn-blood" style={{ width: "100%", justifyContent: "center" }} disabled={bk.status === "sending"}>
        {bk.status === "sending" ? c.reservas.sending : c.reservas.submit}<span className="arr">→</span>
      </button>
    </form>
  );
}

export function Reservas() {
  const { c, data, tw } = useLSC();
  const bk = useBooking();
  return (
    <section id="reservas" className="section reservas">
      <div className="wrap reservas-grid">
        <div className="reservas-rail">
          <div className="eyebrow" style={{ marginBottom: 18 }}><span className="tick">[{c.reservas.idx}]</span> {c.reservas.eyebrow}</div>
          <h2 className="sect-title" style={{ marginBottom: 20 }}>{c.reservas.title}</h2>
          <p className="lede" style={{ marginBottom: 36 }}>{c.reservas.lede}</p>

          <a href={"tel:" + data.phoneHref} className="phone-cta">
            <span className="phone-label">{c.reservas.call}</span>
            <span className="phone-num">{data.phone}</span>
          </a>

          <div className="rail-trust">
            <Stars size={15} />
            <span><strong>{data.rating}</strong> · {data.reviews} {c.trust.reviews.toLowerCase()} · Google</span>
          </div>
        </div>

        <div className="reservas-form">
          {tw.reservas === "ficha" ? <ReservasFicha bk={bk} /> : <ReservasWizard bk={bk} />}
        </div>
      </div>
    </section>
  );
}

export function Galeria() {
  const { c, data } = useLSC();
  const [filter, setFilter] = useState("all");
  const [box, setBox] = useState(null);

  const tabs = ["all", ...data.styleKeys];
  const items = useMemo(
    () => data.gallery.filter((g) => filter === "all" || g.style === filter),
    [filter]
  );

  const styleName = (k) => (k === "all" ? c.galeria.all : c.estilos.items[k].name);

  useEffect(() => {
    if (box === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setBox(null);
      if (e.key === "ArrowRight") setBox((b) => (b + 1) % items.length);
      if (e.key === "ArrowLeft") setBox((b) => (b - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [box, items.length]);

  const current = box !== null ? items[box] : null;

  return (
    <section id="galeria" className="section galeria">
      <div className="wrap">
        <SectionHead idx={c.galeria.idx} eyebrow={c.galeria.eyebrow} title={c.galeria.title} lede={c.galeria.lede} />
        <Reveal className="filter-tabs">
          {tabs.map((k) => (
            <button key={k} className={"filter-tab" + (filter === k ? " active" : "")} onClick={() => setFilter(k)}>
              {styleName(k)}
              <span className="filter-count">{k === "all" ? data.gallery.length : data.gallery.filter((g) => g.style === k).length}</span>
            </button>
          ))}
        </Reveal>

        {items.length === 0 ? (
          <p className="lede" style={{ opacity: 0.6 }}>{c.galeria.empty}</p>
        ) : (
          <div className="masonry">
            {items.map((g, i) => (
              <button key={g.id} className="masonry-item" style={{ aspectRatio: g.ar }} onClick={() => setBox(i)}>
                <div className={"ph masonry-fill " + g.duo}>
                  <image-slot id={g.id} class="masonry-slot" shape="rect" fit="cover"
                    placeholder=""></image-slot>
                </div>
                <div className="masonry-over">
                  <span className="masonry-style">{styleName(g.style)}</span>
                  <span className="masonry-view">{c.galeria.view} ↗</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {current && (
        <div className="lightbox" onClick={() => setBox(null)}>
          <button className="lb-close" onClick={() => setBox(null)} aria-label="Cerrar">✕</button>
          <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); setBox((b) => (b - 1 + items.length) % items.length); }} aria-label="Anterior">←</button>
          <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
            <div className={"lb-img ph " + current.duo} style={{ aspectRatio: current.ar }}></div>
            <div className="lb-meta">
              <span className="eyebrow"><span className="tick">[{String(box + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}]</span> {styleName(current.style)}</span>
              <span className="lsc-word" style={{ fontSize: 22 }}>La&nbsp;Sacra&nbsp;Corona</span>
            </div>
          </div>
          <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); setBox((b) => (b + 1) % items.length); }} aria-label="Siguiente">→</button>
        </div>
      )}
    </section>
  );
}

function TestimonioCard({ item }) {
  return (
    <div className="testimonio-card">
      <span className="testimonio-mark" aria-hidden="true">"</span>
      <blockquote className="testimonio-q">{item.q}</blockquote>
      <footer className="testimonio-foot">
        <span className="testimonio-author">{item.author}</span>
        <span className="testimonio-sep" aria-hidden="true">·</span>
        <span className="testimonio-style">{item.style}</span>
        <span className="testimonio-year idx">{item.year}</span>
      </footer>
    </div>
  );
}

export function Testimonios() {
  const { c, data } = useLSC();
  const t = c.testimonios;
  const mapsHref = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("La Sacra Corona Sevilla");
  return (
    <section id="testimonios" className="section section--tight testimonios">
      <div className="wrap">
        <SectionHead
          idx={t.idx}
          eyebrow={t.eyebrow}
          title={t.title}
          lede={t.lede}
        />
        <div className="testimonios-grid">
          {t.items.map((item, i) => (
            <Reveal key={i} delay={i * 70}>
              <TestimonioCard item={item} />
            </Reveal>
          ))}
        </div>
        <Reveal delay={200} className="testimonios-cta">
          <Stars size={15} />
          <span className="lede" style={{ fontSize: "15px" }}>
            {data.rating} · {data.reviews} {c.trust.reviews.toLowerCase()} · Google
          </span>
          <a href={mapsHref} target="_blank" rel="noopener" className="btn btn-ghost">
            {t.google}<span className="arr"> ↗</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function MapDark({ seed }) {
  const lines = seed === 0
    ? ["M0 60 L300 90", "M40 0 L120 200", "M0 140 L300 120", "M180 0 L230 200", "M0 30 L300 20", "M90 0 L70 200"]
    : ["M0 100 L300 70", "M70 0 L140 200", "M0 40 L300 60", "M210 0 L170 200", "M0 160 L300 150", "M30 0 L60 200"];
  return (
    <div className="map-dark ph">
      <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" className="map-svg" aria-hidden="true">
        {lines.map((d, i) => <path key={i} d={d} stroke="rgba(232,224,208,0.10)" strokeWidth={i % 2 ? 1 : 6} fill="none" />)}
        <circle cx="150" cy="100" r="60" stroke="rgba(232,224,208,0.05)" strokeWidth="1" fill="none" />
      </svg>
      <span className="map-pin"><span className="pin-dot"></span><span className="pin-ring"></span></span>
    </div>
  );
}

export function Localizacion() {
  const { c } = useLSC();
  return (
    <section id="estudios" className="section localizacion">
      <div className="wrap">
        <SectionHead idx={c.loc.idx} eyebrow={c.loc.eyebrow} title={c.loc.title} lede={c.loc.lede} />
        <div className="loc-grid">
          {c.loc.studios.map((s, i) => (
            <Reveal key={s.id} delay={i * 90} className="loc-card">
              <MapDark seed={i} />
              <div className="loc-body">
                <div className="loc-top">
                  <h3 className="loc-name">{s.name}</h3>
                  <span className="loc-tag">{s.tag}</span>
                </div>
                <div className="loc-rows">
                  <div className="loc-row"><span className="loc-k">↳</span><span>{s.addr}<br/>{s.city}</span></div>
                  <div className="loc-row"><span className="loc-k">{c.loc.hoursLabel}</span><span>{s.hours}</span></div>
                </div>
                <a className="loc-dir" href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.addr + ", " + s.city)} target="_blank" rel="noopener">
                  {c.loc.directions} ↗
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { c, data } = useLSC();
  const year = new Date().getFullYear();
  return (
    <footer className="lsc-footer">
      <div className="wrap">
        <div className="footer-cta">
          <div className="footer-word lsc-word">La&nbsp;Sacra<br/>Corona</div>
          <div className="footer-cta-right">
            <p className="footer-tagline display" style={{ fontSize: "clamp(20px,2.4vw,30px)" }}>{c.footer.tagline}</p>
            <a href="#reservas" className="btn btn-blood">{c.footer.reserva}<span className="arr">→</span></a>
          </div>
        </div>

        <hr className="hairline" style={{ margin: "clamp(40px,5vw,64px) 0" }} />

        <div className="footer-cols">
          <div className="footer-col">
            <span className="footer-h">{c.footer.cols.visit}</span>
            <a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("C/ Feria 35, Sevilla")} target="_blank" rel="noopener">C/ Feria 35, Sevilla</a>
            <span>{c.footer.hours}</span>
            <a href={"tel:" + data.phoneHref}>{data.phone}</a>
            <a href={"mailto:" + data.email}>{data.email}</a>
          </div>
          <div className="footer-col">
            <span className="footer-h">{c.footer.cols.follow}</span>
            <a href={"https://instagram.com/" + data.instagram} target="_blank" rel="noopener">Instagram @{data.instagram} ↗</a>
            <a href={"https://wa.me/" + data.whatsapp} target="_blank" rel="noopener">WhatsApp ↗</a>
            <a href="#galeria">{c.nav.galeria} →</a>
          </div>
          <div className="footer-col">
            <span className="footer-h">{c.footer.cols.legal}</span>
            {c.footer.legal.map((l, i) => <a key={i} href="#top">{l}</a>)}
          </div>
        </div>

        <div className="footer-bottom">
          <span className="idx">© {year} La Sacra Corona — {c.footer.rights}</span>
          <span className="idx">{c.footer.made} · {data.rating}★ ({data.reviews})</span>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFloat() {
  const { c, data } = useLSC();
  const href = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(c.wa.msg);
  return (
    <a className="wa-float" href={href} target="_blank" rel="noopener" aria-label="WhatsApp">
      <span className="wa-tip">{c.wa.label}</span>
      <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.2-.4c-1-1.6-1.5-3.4-1.5-5.3C5 9.5 9.9 5 16 5s11 4.5 11 10c0 5.4-4.9 9.8-11 9.8zm6-7.4c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.4-.6.1-.2 0-.4 0-.6-.1-.2-.8-1.9-1-2.6-.3-.7-.5-.6-.7-.6h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.3 2.5 3.8 6 5.3.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.4z"/>
      </svg>
    </a>
  );
}
