/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ICONS, PROJECTS, EXPERIENCE, SKILLS } from "./constants";
import { Section, Card, Badge, Button } from "./components/UI";
import { translations, Language } from "./translations";

export default function App() {
  const [activeNav, setActiveNav] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = ["home", "about", "skills", "projects", "experience", "contact"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 400) {
            setActiveNav(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const toggleLang = () => {
    setLang(prev => prev === "en" ? "ko" : "en");
  };

  const getContactEndpoints = () => {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    return [
      "/api/contact",
      `${protocol}//${host}:3004/api/contact`,
    ];
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");

    try {
      const requestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      };

      for (const endpoint of getContactEndpoints()) {
        try {
          const response = await fetch(endpoint, requestInit);
          const contentType = response.headers.get("content-type") ?? "";

          if (response.ok && contentType.includes("application/json")) {
            const data = await response.json();
            if (data?.success) {
              setFormStatus("success");
              setContactForm({ name: "", email: "", message: "" });
              setTimeout(() => setFormStatus("idle"), 5000);
              return;
            }
          }
        } catch {
          // Try the next endpoint below.
        }
      }

      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    } catch {
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-black text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "py-4 bg-black/80 border-b border-white/10 shadow-lg" : "py-8"
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => scrollTo('home')}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-black rounded border border-white/20 flex items-center justify-center text-white font-mono font-bold text-xl group-hover:border-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                D
              </div>
              <div className="absolute -inset-1 border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <span className="font-mono font-bold tracking-[0.2em] text-white text-lg">DYLAN_ISLOM</span>
              <p className="text-[10px] text-accent font-bold tracking-widest leading-none mt-1 uppercase">Sys_Arch // Full_Stack</p>
            </div>
          </motion.div>

          <div className="hidden md:flex gap-8 items-center font-mono">
            {["About", "Skills", "Projects", "Experience"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className={`text-xs font-bold tracking-widest transition-all uppercase hover:text-white relative group ${
                  activeNav === item.toLowerCase() ? "text-white" : "text-neutral-500"
                }`}
              >
                {t.nav[item.toLowerCase() as keyof typeof t.nav]}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-white transition-all ${activeNav === item.toLowerCase() ? "w-full" : "w-0 group-hover:w-full"}`} />
              </button>
            ))}
            
            <div className="h-4 w-px bg-white/10 mx-2" />
            
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:border-white/30 transition-all font-mono group/lang"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{lang === 'en' ? 'KO' : 'EN'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={toggleLang}
              className="px-2 py-1 rounded border border-white/10 text-[10px] font-bold"
            >
              {lang === "en" ? "KR" : "EN"}
            </button>
            <button 
              className="text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <ICONS.Close /> : <ICONS.Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-8 font-mono bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"
          >
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
            {["Home", "About", "Skills", "Projects", "Experience", "Contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-2xl font-bold uppercase tracking-widest text-white hover:text-neutral-400 transition-colors"
              >
                {t.nav[item.toLowerCase() as keyof typeof t.nav] || item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative pt-60 pb-40 px-6 md:px-12 lg:px-24 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
          <div className="scanline opacity-20" />
          
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
            <div className="flex-[1.5] text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 rounded-sm text-[10px] font-mono font-bold tracking-widest text-white uppercase mb-8">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {t.hero.location}
                </div>
                <h1 className="text-5xl md:text-8xl font-display font-black mb-8 tracking-tighter text-white leading-none uppercase">
                  {t.hero.title.split('Robust').map((part, i) => (
                    <span key={i}>
                      {part}
                      {i === 0 && <span className="text-white underline decoration-white/20 decoration-8 underline-offset-4 italic">Robust</span>}
                    </span>
                  ))}
                </h1>
                <div className="flex items-start gap-4 mb-12 max-w-xl">
                  <div className="w-1 bg-white/20 h-24 mt-1" />
                  <p className="text-xl text-neutral-400 font-mono leading-relaxed">
                    {t.hero.subtitle}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Button variant="primary" onClick={() => scrollTo('projects')} className="group">
                    <span className="flex items-center gap-2">
                       {t.hero.ctaProjects} <ICONS.Arrow className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 border-white/30 hover:bg-white/10 hover:border-white transition-all group/cv">
                    <ICONS.Download size={18} className="group-hover/cv:-translate-y-1 transition-transform text-white" /> {t.hero.ctaCv}
                  </Button>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex-1 perspective-1000 hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* HUD Elements around image */}
                <div className="absolute -inset-4 border border-white/10 rounded-2xl animate-[pulse_4s_infinite]" />
                <div className="absolute -inset-8 border border-white/5 rounded-2xl animate-[pulse_6s_infinite]" />
                
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/50 z-20" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/50 z-20" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/50 z-20" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/50 z-20" />
                
                <div className="absolute inset-0 overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 group">
                  <img 
                    src="/profile.png" 
                    alt="Dylan Islom" 
                    className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-700"
                  />
                  {/* Decorative Scanlines on image */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none h-1/4 animate-[scan_3s_linear_infinite]" />
                </div>

                <Card className="absolute -bottom-10 -right-10 p-6 glass border-white/20 z-30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded">
                      <ICONS.AI className="text-black" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-white uppercase font-bold tracking-widest mb-1">M.S. Candidate</p>
                      <p className="text-sm font-mono font-bold text-white">AI & Convergence</p>
                    </div>
                  </div>
                </Card>

                <div className="absolute -top-10 -left-10 z-30 rotate-12">
                  <div className="bg-neutral-900 border border-white/10 px-4 py-2 rounded shadow-2xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-mono text-white">SYS_ONLINE // V_4.2.0</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <Section id="about" title={t.about.title}>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6 text-lg text-neutral-300 leading-relaxed">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <div className="flex flex-wrap gap-4 items-center pt-6">
                <div className="flex gap-2">
                  {["EN", "RU", "UZ", "KR", "CN"].map((lang) => (
                    <div 
                      key={lang} 
                      className="h-8 min-w-[32px] px-2 rounded-sm border border-white/10 bg-white/5 flex items-center justify-center text-[10px] font-mono font-bold text-white hover:border-white/30 transition-colors"
                    >
                      {lang}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-[0.2em]">_Multilingual_Comm</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="flex flex-col gap-2">
                <h4 className="text-4xl font-black text-white terminal-text">4+</h4>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold font-mono">{t.about.stats.experience}</p>
              </Card>
              <Card className="flex flex-col gap-2">
                <h4 className="text-4xl font-black text-white terminal-text">10+</h4>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold font-mono">{t.about.stats.products}</p>
              </Card>
              <Card className="flex flex-col gap-2">
                <h4 className="text-4xl font-black text-white terminal-text">230k</h4>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold font-mono">{t.about.stats.users}</p>
              </Card>
              <Card className="flex flex-col gap-2">
                <h4 className="text-4xl font-black text-white terminal-text">99%</h4>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold font-mono">{t.about.stats.crashFree}</p>
              </Card>
            </div>
          </div>
        </Section>

        {/* Skills Section */}
        <Section id="skills" title={t.skills.title} subtitle={t.skills.subtitle}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SKILLS.map((skill, idx) => {
              const Icon = ICONS[skill.icon as keyof typeof ICONS];
              return (
                <Card key={idx} className="h-full flex flex-col hover:border-white/40">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/10 text-white rounded-xl border border-white/10">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold">{skill.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {skill.tags.map(tag => (
                      <Badge key={tag} className="bg-white/5 border-white/10 text-neutral-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* Projects Section */}
        <Section id="projects" title={t.projects.title} subtitle={t.projects.subtitle}>
          <div className="grid md:grid-cols-2 gap-10">
            {PROJECTS.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="h-full flex flex-col glass rounded-3xl overflow-hidden border shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="h-64 bg-neutral-800 overflow-hidden relative">
                    <div className="absolute inset-x-0 bottom-0 p-6 z-10 bg-gradient-to-t from-black/80 to-transparent">
                      <Badge className="bg-white/20 text-white border-white/30 mb-2">
                        {t.projects.items[idx]?.category || project.category}
                      </Badge>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{project.title}</h3>
                    </div>
                    <img 
                      src={project.image || `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&id=${idx}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt={project.title} 
                    />
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <p className="text-neutral-400 mb-6 line-clamp-3">
                      {t.projects.items[idx]?.description || project.description}
                    </p>
                    {(t.projects.items[idx]?.impact || project.impact) && (
                      <div className="mb-8 p-5 bg-white/[0.03] rounded-sm relative overflow-hidden group/outcome border border-white/5">
                        <div className="absolute inset-0 grid-bg-fine opacity-10" />
                        <div className="flex items-center gap-2 mb-3 font-mono text-[10px] font-bold text-white uppercase tracking-widest relative z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          System_Output // Impact
                        </div>
                        <p className="text-sm font-mono text-neutral-400 leading-relaxed italic relative z-10">
                          "{t.projects.items[idx]?.impact || project.impact}"
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.stack.map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      {project.link ? (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-white font-mono font-bold hover:gap-3 transition-all underline decoration-white/20 underline-offset-4"
                        >
                          {t.projects.visit} <ICONS.External size={16} />
                        </a>
                      ) : (
                        <span className="text-neutral-500 text-sm font-mono italic">{t.projects.confidential}</span>
                      )}
                      
                      <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <ICONS.Arrow />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-20 flex flex-col items-center">
            <Card className="w-full md:w-fit px-10 py-8 text-center flex flex-col md:flex-row items-center gap-8 border-dashed border-2 border-white/10 bg-white/[0.02]">
              <div className="flex flex-col items-center">
                <ICONS.GitHub size={32} className="mb-3 text-white" />
                <h4 className="font-bold">{t.projects.githubTitle}</h4>
              </div>
              <div className="h-px w-full md:w-px md:h-12 bg-white/10" />
              <p className="max-w-md text-neutral-500 font-mono text-sm leading-relaxed">
                {t.projects.githubDesc}
              </p>
              <Button variant="outline" className="shrink-0" onClick={() => window.open('https://github.com/BbooKki', '_blank')}>
                Follow @BbooKki
              </Button>
            </Card>
          </div>
        </Section>

        {/* Experience Timeline */}
        <Section id="experience" title={t.experience.title}>
          <div className="relative border-l-2 border-white/10 ml-4 md:ml-32 py-10">
            {EXPERIENCE.map((exp, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="mb-16 relative"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-black border-2 border-white" />
                
                {/* Date Label (Desktop Only) */}
                <div className="absolute -left-[120px] md:-left-[150px] top-0 hidden md:block w-32 text-right">
                  <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest font-mono">{exp.period}</span>
                </div>

                <div className="ml-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{t.experience.items[idx]?.role || exp.role}</h3>
                    <div className="md:hidden">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest font-mono">{exp.period}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white font-mono font-semibold mb-6">
                    <span>{exp.company}</span>
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-neutral-500 font-normal">{exp.location}</span>
                  </div>
                  <ul className="space-y-4">
                    {(t.experience.items[idx]?.points || exp.points).map((point, pIdx) => (
                      <li key={pIdx} className="flex gap-4 group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white group-hover:scale-150 transition-transform flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                        <p className="text-neutral-400 leading-relaxed font-mono text-sm">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Contact Section */}
        <Section id="contact" className="bg-black text-white">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">{t.contact.title.split('future')[0]} <span className="text-white underline decoration-white/30 decoration-8 underline-offset-8 italic">future</span> {t.contact.title.split('future')[1]}</h2>
              <p className="text-xl text-neutral-400 mb-12 font-mono leading-relaxed">
                {t.contact.subtitle}
              </p>
              
              <div className="space-y-6">
                <a href="mailto:bbookki1998@gmail.com" className="flex items-center gap-4 group">
                  <div className="p-3 rounded-full bg-white/5 group-hover:bg-white transition-all">
                    <ICONS.Mail size={22} className="text-neutral-400 group-hover:text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 uppercase font-bold tracking-widest font-mono">{t.contact.emailMe}</p>
                    <p className="text-lg font-bold font-mono">bbookki1998@gmail.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-4 group">
                  <div className="p-3 rounded-full bg-white/5">
                    <ICONS.Map size={22} className="text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 uppercase font-bold tracking-widest font-mono">{t.contact.location}</p>
                    <p className="text-lg font-bold font-mono">Seoul, South Korea</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex gap-4">
                <a href="https://github.com/BbooKki" className="p-4 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all">
                  <ICONS.GitHub size={24} />
                </a>

              </div>
            </div>

            <Card className="p-10 border-white/10 bg-white/[0.02]">
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-400 uppercase tracking-widest font-mono">{t.contact.form.name}</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-white focus:border-white/40 outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-400 uppercase tracking-widest font-mono">{t.contact.form.email}</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-white focus:border-white/40 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-400 uppercase tracking-widest font-mono">{t.contact.form.message}</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-white focus:border-white/40 outline-none transition-all font-mono resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full py-4 text-lg"
                  disabled={formStatus === "sending"}
                >
                  {formStatus === "sending" ? "SENDING..." : formStatus === "success" ? "SENT!" : formStatus === "error" ? "FAILED" : t.contact.form.send}
                </Button>
              </form>
            </Card>
          </div>
        </Section>
      </main>

      <footer className="py-20 border-t border-white/5 relative overflow-hidden bg-black">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-12 mb-16">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center text-black font-mono font-bold text-sm">
                  D
                </div>
                <span className="font-mono font-bold tracking-[0.2em] text-white">DYLAN_ISLOM</span>
              </div>
              <p className="text-neutral-500 text-sm font-mono leading-relaxed">
                Refining the intersection of backend stability and intelligent system convergence.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.3em]">Navigation</h4>
              <div className="grid grid-cols-2 gap-4">
                {["Home", "About", "Skills", "Projects", "Experience", "Contact"].map(item => (
                  <button 
                    key={item} 
                    onClick={() => scrollTo(item.toLowerCase())}
                    className="text-neutral-400 hover:text-white transition-colors text-xs font-mono text-left"
                  >
                    {`// ${item.toUpperCase()}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.3em]">System_Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-500 italic">CORE_TEMP</span>
                  <span className="text-white">OPTIMAL</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-500 italic">UPTIME</span>
                  <span className="text-white">99.98%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-500 italic">LOCATION</span>
                  <span className="text-white">SEOUL, KR</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/5 mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
            <p className="text-neutral-600 text-[10px] font-mono uppercase tracking-widest">
              © {new Date().getFullYear()} DYLAN_ISLOM // ALL_RIGHTS_RESERVED
            </p>
            <div className="flex gap-6 uppercase text-[10px] font-mono font-bold tracking-widest">
              <a href="https://github.com/BbooKki" className="text-neutral-500 hover:text-white transition-colors">GitHub</a>

              <a href="#" className="text-neutral-500 hover:text-white transition-colors">RSS</a>
            </div>
          </div>
        </div>
      </footer>

        {/* Success/Error Popup */}
        <AnimatePresence>
          {(formStatus === "success" || formStatus === "error") && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 z-50"
            >
              <div className={`px-6 py-4 rounded-lg shadow-lg font-mono font-bold tracking-widest ${
                formStatus === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
              }`}>
                {formStatus === "success" ? "MESSAGE SENT!" : "FAILED TO SEND"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
