/* La Sacra Corona — Nav + Hero (3 variants) + Estilos + Artistas */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

/* =========================================================================
   NAV — sticky, transparent over hero, blur on scroll
   ========================================================================= */
function Nav() {
  const { c, lang, setLang } = useLSC();
  const [scrolled, setScrolled] = useStateA(false);
  const [open, setOpen] = useStateA(false);

  useEffectA(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#estilos", label: c.nav.estilos },
    { href: "#artistas", label: c.nav.artistas },
    { href: "#galeria", label: c.nav.galeria },
    { href: "#estudios", label: c.nav.visita },
  ];

  return (
    <header className={"lsc-nav" + (scrolled ? " is-scrolled" : "")}>
      <div className="lsc-nav-inner wrap">
        <Logo wordSize={17} emblemSize={34} />

        <nav className="lsc-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="navlink">{l.label}</a>
          ))}
        </nav>

        <div className="lsc-nav-right">
          <button className="lang-toggle" onClick={() => setLang(lang === "es" ? "en" : "es")}
                  aria-label="Cambiar idioma">
            <span className={lang === "es" ? "on" : ""}>ES</span>
            <span className="slash">/</span>
            <span className={lang === "en" ? "on" : ""}>EN</span>
          </button>
          <a href="#reservas" className="btn btn-blood lsc-nav-cta">{c.nav.reserva}<span className="arr">→</span></a>
          <button className={"burger" + (open ? " open" : "")} onClick={() => setOpen(!open)} aria-label="Menú">
            <span></span><span></span>
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      <div className={"lsc-sheet" + (open ? " open" : "")}>
        {links.map((l) => (
          <a key={l.href} href={l.href} className="sheet-link" onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <a href="#reservas" className="btn btn-blood" style={{ marginTop: 12 }} onClick={() => setOpen(false)}>
          {c.nav.reserva}<span className="arr">→</span>
        </a>
      </div>
    </header>
  );
}

/* =========================================================================
   HERO
   ========================================================================= */
function HeroAtmosphere() {
  const ref = useRefA(null);
  useEffectA(() => {
    if (!ref.current || !window.LSCAtmosphere) return;
    const inst = window.LSCAtmosphere.mount(ref.current);
    return () => inst.destroy();
  }, []);
  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}

function ScrollCue({ label, inClass }) {
  return (
    <div className={"scroll-cue" + (inClass || "")}>
      <span className="eyebrow">{label}</span>
      <span className="cue-line"></span>
    </div>
  );
}

function HeroActions() {
  const { c } = useLSC();
  return (
    <div className="hero-actions">
      <a href="#reservas" className="btn btn-blood">{c.hero.cta}<span className="arr">→</span></a>
      <a href="#galeria" className="btn btn-outline">{c.hero.cta2}<span className="arr">↘</span></a>
    </div>
  );
}

function Hero() {
  const { c, tw, ready } = useLSC();
  const mode = tw.hero || "editorial";
  const i = ready ? " in" : "";

  const eyebrow = (
    <div className={"eyebrow eyebrow--bone hero-eyebrow hero-rise d1" + i}>
      {c.hero.eyebrow}<span className="tick">·</span><span>{c.hero.since}</span>
    </div>
  );

  // headline lines clip-rise from a mask on load (driven by `ready`)
  const headline = (
    <h1 className="display hero-title">
      <span className="hero-line-mask"><span className={"ln" + i}>{c.hero.titleA}</span></span>
      <span className="hero-line-mask"><span className={"ln ital" + i}>{c.hero.titleB}</span></span>
    </h1>
  );

  if (mode === "sello") {
    return (
      <section id="top" className="hero hero--sello" data-screen-label="Hero">
        <HeroAtmosphere />
        <div className="hero-inner wrap">
          <div className={"hero-seal hero-rise d1" + i}><Emblem size={66} stroke={1.2} /></div>
          {eyebrow}
          {headline}
          <p className={"lede hero-lede hero-rise d3" + i} style={{ marginInline: "auto" }}>{c.hero.lede}</p>
          <div className={"hero-rise d4" + i}><HeroActions /></div>
          <div className={"hero-trust hero-rise d4" + i}><TrustStrip compact /></div>
        </div>
        <ScrollCue label={c.hero.scroll} inClass={i} />
      </section>
    );
  }

  if (mode === "retrato") {
    return (
      <section id="top" className="hero hero--retrato" data-screen-label="Hero">
        <image-slot id="hero-photo" class="hero-photo"
          shape="rect" fit="cover"
          placeholder={c.lang.current === "ES" ? "Suelta una foto de tatuaje en proceso" : "Drop a tattoo-in-progress photo"}></image-slot>
        <div className="hero-photo-scrim"></div>
        <HeroAtmosphere />
        <div className="hero-inner wrap">
          <div className="hero-retrato-text">
            {eyebrow}
            {headline}
            <p className={"lede hero-lede hero-rise d3" + i}>{c.hero.lede}</p>
            <div className={"hero-rise d4" + i}><HeroActions /></div>
          </div>
        </div>
        <div className={"hero-trust hero-trust--retrato wrap hero-rise d4" + i}><TrustStrip compact /></div>
        <ScrollCue label={c.hero.scroll} inClass={i} />
      </section>
    );
  }

  // editorial (default) — hard-left, asymmetric
  return (
    <section id="top" className="hero hero--editorial" data-screen-label="Hero">
      <HeroAtmosphere />
      <div className="hero-inner wrap">
        <div className="hero-ed-text">
          {eyebrow}
          {headline}
          <p className={"lede hero-lede hero-rise d3" + i}>{c.hero.lede}</p>
          <div className={"hero-rise d4" + i}><HeroActions /></div>
        </div>
        <div className={"hero-trust hero-rise d4" + i}><TrustStrip /></div>
      </div>
      <ScrollCue label={c.hero.scroll} inClass={i} />
    </section>
  );
}

/* =========================================================================
   ESTILOS — horizontal scroll cards
   ========================================================================= */
function Estilos() {
  const { c, data } = useLSC();
  const trackRef = useRefA(null);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: "smooth" });
  };

  return (
    <section id="estilos" className="section estilos">
      <div className="wrap">
        <SectionHead
          idx={c.estilos.idx}
          eyebrow={c.estilos.eyebrow}
          title={c.estilos.title}
          lede={c.estilos.lede}
          action={
            <div className="estilos-arrows">
              <button className="round-arrow" onClick={() => scrollBy(-1)} aria-label="Anterior">←</button>
              <button className="round-arrow" onClick={() => scrollBy(1)} aria-label="Siguiente">→</button>
            </div>
          }
        />
      </div>

      <div className="estilos-track" ref={trackRef}>
        <div className="estilos-pad" aria-hidden="true"></div>
        {data.styleKeys.map((k, i) => {
          const it = c.estilos.items[k];
          return (
            <Reveal key={k} delay={i * 70} className="estilo-card">
              <div className={"estilo-img ph " + data.styleDuo[k]}>
                <span className="estilo-num idx">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="estilo-body">
                <h3 className="estilo-name">{it.name}</h3>
                <p className="estilo-desc">{it.desc}</p>
              </div>
            </Reveal>
          );
        })}
        <div className="estilos-pad" aria-hidden="true"></div>
      </div>
    </section>
  );
}

/* =========================================================================
   ARTISTAS — two-column profiles, animated border on hover
   ========================================================================= */
function ArtistCard({ a, i }) {
  const { c } = useLSC();
  const bio = c.artistas.bios[a.id];
  return (
    <Reveal delay={(i % 2) * 90} className="artist-card">
      <div className="artist-photo ph">
        <image-slot id={a.id} class="artist-slot" shape="rect" fit="cover"
          placeholder={c.lang.current === "ES" ? "Retrato B/N" : "B&W portrait"}></image-slot>
        <span className="artist-index idx">[{String(i + 1).padStart(2, "0")}]</span>
      </div>
      <div className="artist-info">
        <div className="artist-top">
          <h3 className="artist-name">{a.name}</h3>
          <span className="artist-role">{bio.role}</span>
        </div>
        <p className="artist-bio">{bio.bio}</p>
        <div className="artist-meta">
          <span className="idx">{c.artistas.since} {a.since}</span>
          <a href={"https://instagram.com/" + a.ig} target="_blank" rel="noopener" className="artist-ig">@{a.ig} ↗</a>
        </div>
      </div>
    </Reveal>
  );
}

function Artistas() {
  const { c, data } = useLSC();
  return (
    <section id="artistas" className="section artistas">
      <div className="wrap">
        <SectionHead
          idx={c.artistas.idx}
          eyebrow={c.artistas.eyebrow}
          title={c.artistas.title}
          lede={c.artistas.lede}
          action={<a href="#reservas" className="btn btn-outline">{c.artistas.cta}<span className="arr">→</span></a>}
        />
        <div className="artist-grid">
          {data.artists.map((a, i) => <ArtistCard key={a.id} a={a} i={i} />)}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   PROCESO — 4-step process overview
   ========================================================================= */
function Proceso() {
  const { c } = useLSC();
  const p = c.proceso;
  return (
    <section id="proceso" className="section section--tight proceso">
      <div className="wrap">
        <SectionHead
          eyebrow={p.eyebrow}
          title={p.title}
          lede={p.lede}
          action={<a href="#reservas" className="btn btn-outline">{p.cta}<span className="arr">→</span></a>}
        />
        <div className="proceso-grid">
          {p.steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} className="proceso-step">
              <span className="proceso-n">{s.n}</span>
              <span className="proceso-num-display">{s.title}</span>
              <p className="proceso-desc">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero, Estilos, Artistas, Proceso });
