import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, ArrowRight, Search, Mail, Phone, MapPin, ChevronDown, Menu, X,
  Briefcase, Award, Users, Building2, Cpu, Code2, LineChart, Rocket, BookOpen,
  FlaskConical, Wifi, Trophy, ShieldCheck, FileText, Upload, CheckCircle, Sparkles, Clock, LogIn, UserRound, KeyRound
} from "lucide-react";
import Logo from "./Logo";
import "./landing.css";

/* ====== EDIT THESE: contact, stats & content live here ====== */
const CONTACT = {
  email: "admissions@iem.edu.in",
  phones: ["8010700500", "8069795500"],
  address: "Institute of Engineering & Management, Kolkata, West Bengal",
};
const STATS = [
  { value: 20, suffix: "+", label: "Years of academic excellence" },
  { value: 100, suffix: "+", label: "Recruiting companies every year" },
  { value: 5000, suffix: "+", label: "Students on campus" },
  { value: 90, suffix: "%", label: "Placement assistance" },
];
const RECRUITERS = ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Capgemini", "Deloitte", "IBM", "Tech Mahindra", "Amazon", "Microsoft", "Genpact"];
const PROGRAMS = [
  { icon: Cpu, title: "B.Tech", text: "Computer Science, AI & ML, IT, Electronics, Electrical, Mechanical and Civil." },
  { icon: Code2, title: "BCA", text: "Industry-aligned computing degree with hands-on projects and internships." },
  { icon: LineChart, title: "BBA", text: "Build business foundations in management, finance and marketing." },
  { icon: Briefcase, title: "MBA / PGDM", text: "Leadership-focused management programme with strong corporate exposure." },
  { icon: FlaskConical, title: "M.Tech", text: "Advanced specialisations with research guidance and lab access." },
  { icon: BookOpen, title: "Other Programmes", text: "Explore more undergraduate and postgraduate options at IEM." },
];
const WHY = [
  { icon: Building2, title: "Modern campus", text: "Smart classrooms, well-equipped labs and a vibrant student life." },
  { icon: Users, title: "Experienced faculty", text: "Mentors from academia and industry who guide you every step." },
  { icon: Wifi, title: "Industry connect", text: "Workshops, guest lectures, hackathons and live projects." },
  { icon: Trophy, title: "Clubs & events", text: "Tech fests, cultural nights and sports that shape all-round growth." },
];
const STEPS = [
  { icon: Users, title: "Register", text: "Create your student account." },
  { icon: FileText, title: "Apply", text: "Fill in the admission form." },
  { icon: Upload, title: "Upload", text: "Submit required documents." },
  { icon: CheckCircle, title: "Track", text: "Follow your status and pay the fee." },
];
const FAQS = [
  { q: "How do I apply for admission at IEM?", a: "Click “Apply Now”, create your student account, complete the admission form and upload the required documents. You can then track your status from your dashboard." },
  { q: "Which documents are required?", a: "Photograph, Class 10 marksheet, Class 12 marksheet, Aadhaar card and Transfer Certificate. Accepted formats are PDF, JPG, JPEG and PNG, up to 5 MB each." },
  { q: "Can I save my application and continue later?", a: "Yes. You can save your details as a draft and return any time before the final submission." },
  { q: "When can I pay the admission fee?", a: "Fee payment unlocks after the admissions team approves your application." },
  { q: "How will I know my application status?", a: "Your dashboard shows whether your application is Submitted, Under Review, Approved or Rejected." },
  { q: "Who do I contact for help?", a: `Write to ${CONTACT.email} or call the Admission Helpline at ${CONTACT.phones.join(" / ")}.` },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".lp-reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now(), dur = 1600;
      const tick = (t) => {
        const p = Math.min((t - start) / dur, 1);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{n.toLocaleString("en-IN")}{suffix}</span>;
}

function LoginMenu({ user, variant }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);
  if (user) {
    const to = user.role === "admin" ? "/admin" : "/dashboard";
    return <Link to={to} className={variant === "hero" ? "lp-btn lp-btn-ghost lp-big" : "lp-signin"}>{variant === "hero" && <LogIn size={18} />} My dashboard</Link>;
  }
  return (
    <div className={`lp-menu ${variant}`} ref={ref}>
      <button className={variant === "hero" ? "lp-btn lp-btn-ghost lp-big" : "lp-signin lp-signin-btn"} onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}>
        <LogIn size={variant === "hero" ? 18 : 16} /> Applicant / Admin Login <ChevronDown size={16} className={open ? "flip" : ""} />
      </button>
      {open && (
        <div className="lp-drop" role="menu">
          <Link to="/login" role="menuitem" onClick={() => setOpen(false)}><UserRound size={18} /><span><b>Applicant Login</b><small>Track your application &amp; payment</small></span></Link>
          <Link to="/admin-login" role="menuitem" onClick={() => setOpen(false)}><KeyRound size={18} /><span><b>Admin Login</b><small>Go straight to the admin sign in</small></span></Link>
        </div>
      )}
    </div>
  );
}

export default function Landing({ user }) {
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  useReveal();
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const applyTo = user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register";
  const go = (id) => { setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <div className="lp">
      {/* top info bar */}
      <div className="lp-top">
        <div className="lp-top-in">
          <button onClick={() => go("faq")}><Search size={15} /> Search</button>
          <a href={`mailto:${CONTACT.email}`}><Mail size={15} /> {CONTACT.email}</a>
          <a href={`tel:${CONTACT.phones[0]}`} className="lp-top-phone"><Phone size={15} /> Admission Helpline - {CONTACT.phones.join(" / ")}</a>
        </div>
      </div>

      {/* nav */}
      <header className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-nav-in">
          <Link to="/" className="lp-brand" aria-label="IEM home">
            <Logo height={62} />
          </Link>
          <nav className={`lp-links ${menu ? "show" : ""}`}>
            {[["about", "About"], ["programs", "Programmes"], ["placements", "Placements"], ["process", "How to Apply"], ["faq", "FAQs"], ["contact", "Contact"]].map(([id, l]) => (
              <button key={id} onClick={() => go(id)}>{l}</button>
            ))}
            <LoginMenu user={user} variant="nav" />
          </nav>
          <Link to={applyTo} className="lp-btn lp-btn-gold lp-nav-cta">Apply Now <ArrowRight size={16} /></Link>
          <button className="lp-burger" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X /> : <Menu />}</button>
        </div>
      </header>

      {/* hero */}
      <section className="lp-hero">
        <div className="lp-blob b1" /><div className="lp-blob b2" /><div className="lp-blob b3" />
        <div className="lp-grid" />
        <div className="lp-hero-in">
          <div className="lp-hero-copy">
            <div className="lp-pill"><span className="lp-dot" /> Admissions Open · 2026–2027</div>
            <h1>Shape your <span className="lp-grad">future</span> at the Institute of Engineering &amp; Management</h1>
            <p>Join one of Kolkata's leading institutions for engineering, technology and management — where learning meets industry and careers take off.</p>
            <div className="lp-hero-actions">
              <Link to={applyTo} className="lp-btn lp-btn-gold lp-big lp-pulse">Apply Now <ArrowRight size={18} /></Link>
              <LoginMenu user={user} variant="hero" />
            </div>
            <div className="lp-hero-meta">
              <span><ShieldCheck size={16} /> Secure online application</span>
              <span><Clock size={16} /> Track status anytime</span>
            </div>
          </div>
          <div className="lp-hero-art">
            <div className="lp-card lp-float">
              <div className="lp-card-top"><Logo height={120} /></div>
              <b>Admissions 2026–27</b>
              <small>Now accepting applications</small>
              <div className="lp-bars"><i /><i /><i /></div>
            </div>
            <div className="lp-chip c1 lp-float2"><Award size={16} /> Strong placements</div>
            <div className="lp-chip c2 lp-float3"><Rocket size={16} /> Industry-ready</div>
            <div className="lp-chip c3 lp-float"><Sparkles size={16} /> Modern campus</div>
            <div className="lp-ring r1" /><div className="lp-ring r2" />
          </div>
        </div>
        <a className="lp-scroll" onClick={() => go("stats")}><ChevronDown /></a>
      </section>

      {/* stats */}
      <section id="stats" className="lp-stats">
        {STATS.map((s) => (
          <div key={s.label} className="lp-stat lp-reveal">
            <b><Counter value={s.value} suffix={s.suffix} /></b>
            <span>{s.label}</span>
          </div>
        ))}
      </section>

      {/* about */}
      <section id="about" className="lp-sec">
        <div className="lp-split">
          <div className="lp-reveal left">
            <div className="lp-eyebrow">ABOUT IEM</div>
            <h2>A tradition of excellence in technology &amp; management education</h2>
            <p>The Institute of Engineering &amp; Management (IEM), Kolkata is committed to nurturing skilled, confident and responsible professionals. With a modern campus, experienced faculty and strong industry partnerships, IEM gives students the knowledge, practice and exposure they need to build rewarding careers.</p>
            <p>From classrooms to labs, hackathons to internships, every experience at IEM is designed to turn curiosity into capability.</p>
            <Link to={applyTo} className="lp-btn lp-btn-navy">Start your application <ArrowRight size={16} /></Link>
          </div>
          <div className="lp-why">
            {WHY.map((w, i) => (
              <div key={w.title} className="lp-why-card lp-reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="lp-ico"><w.icon size={22} /></div>
                <b>{w.title}</b><span>{w.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* programs */}
      <section id="programs" className="lp-sec lp-alt">
        <div className="lp-head lp-reveal"><div className="lp-eyebrow">PROGRAMMES</div><h2>Find the course that fits your ambition</h2></div>
        <div className="lp-programs">
          {PROGRAMS.map((p, i) => (
            <div key={p.title} className="lp-prog lp-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="lp-ico"><p.icon size={24} /></div>
              <h3>{p.title}</h3><p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* placements */}
      <section id="placements" className="lp-place">
        <div className="lp-place-in">
          <div className="lp-head light lp-reveal">
            <div className="lp-eyebrow gold">PLACEMENTS</div>
            <h2>Good placements happen here</h2>
            <p>Dedicated training &amp; placement cell, mock interviews, aptitude and soft-skill coaching — and a steady stream of top recruiters on campus.</p>
          </div>
          <div className="lp-feats">
            {[[Briefcase, "Campus drives", "Leading companies visit every year across IT, consulting and core."], [Users, "Career training", "Aptitude, communication and technical prep from early semesters."], [Award, "Internships", "Real-world exposure that builds a strong profile before graduation."]].map(([I, t, d], i) => (
              <div key={t} className="lp-feat lp-reveal" style={{ transitionDelay: `${i * 100}ms` }}><I size={24} /><b>{t}</b><span>{d}</span></div>
            ))}
          </div>
        </div>
        <div className="lp-marquee"><div className="lp-track">
          {[...RECRUITERS, ...RECRUITERS].map((r, i) => <span key={i}>{r}</span>)}
        </div></div>
        <p className="lp-note">Representative recruiters. Recruiter list and figures may vary by year.</p>
      </section>

      {/* process */}
      <section id="process" className="lp-sec">
        <div className="lp-head lp-reveal"><div className="lp-eyebrow">HOW TO APPLY</div><h2>Four simple steps to your seat</h2></div>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <div key={s.title} className="lp-step lp-reveal" style={{ transitionDelay: `${i * 110}ms` }}>
              <div className="lp-step-n">{i + 1}</div>
              <div className="lp-ico"><s.icon size={22} /></div>
              <b>{s.title}</b><span>{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="lp-sec lp-alt">
        <div className="lp-head lp-reveal"><div className="lp-eyebrow">FAQs</div><h2>Frequently asked questions</h2></div>
        <div className="lp-faq">
          {FAQS.map((f, i) => (
            <div key={f.q} className={`lp-q lp-reveal ${open === i ? "open" : ""}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)}><span>{f.q}</span><ChevronDown size={20} /></button>
              <div className="lp-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta lp-reveal">
        <div>
          <h2>Admissions are open for 2026–2027</h2>
          <p>Take the first step towards a brighter future. Your application takes just a few minutes to start.</p>
        </div>
        <Link to={applyTo} className="lp-btn lp-btn-gold lp-big lp-pulse">Apply Now <ArrowRight size={18} /></Link>
      </section>

      {/* contact / footer */}
      <footer id="contact" className="lp-foot">
        <div className="lp-foot-in">
          <div>
            <div className="lp-foot-logo"><Logo height={96} /></div>
            <p>Institute of Engineering &amp; Management — building skilled professionals for tomorrow.</p>
          </div>
          <div>
            <h4>Contact us</h4>
            <a href={`mailto:${CONTACT.email}`}><Mail size={16} /> {CONTACT.email}</a>
            <a href={`tel:${CONTACT.phones[0]}`}><Phone size={16} /> Admission Helpline: {CONTACT.phones[0]}</a>
            <a href={`tel:${CONTACT.phones[1]}`}><Phone size={16} /> {CONTACT.phones[1]}</a>
            <span><MapPin size={16} /> {CONTACT.address}</span>
          </div>
          <div>
            <h4>Quick links</h4>
            <Link to={applyTo}>Apply Now</Link>
            <Link to="/login">Applicant login</Link>
            <Link to="/admin-login">Admin login</Link>
            <button onClick={() => go("faq")}>FAQs</button>
            <button onClick={() => go("programs")}>Programmes</button>
          </div>
        </div>
        <div className="lp-copy">© {new Date().getFullYear()} Institute of Engineering &amp; Management · Kolkata</div>
      </footer>
    </div>
  );
}
