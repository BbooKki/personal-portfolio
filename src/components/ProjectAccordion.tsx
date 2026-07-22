import {ExternalLink, Github} from "lucide-react";

export interface PortfolioDemo {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  impact: string;
  stack: readonly string[];
  href: string;
  image?: string;
  source?: string;
  actionLabel: string;
  sourceLabel?: string;
}

interface ProjectAccordionProps {
  demos: readonly PortfolioDemo[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ProjectAccordion({demos, activeId, onSelect}: ProjectAccordionProps) {
  return (
    <div className="flex flex-col gap-3 lg:h-[650px] lg:flex-row" role="list" aria-label="Portfolio demos">
      {demos.map((demo) => {
        const isActive = demo.id === activeId;

        return (
          <article
            key={demo.id}
            role="listitem"
            className={`group relative min-w-0 overflow-hidden border bg-neutral-950 transition-[flex,min-height,border-color] duration-500 ease-out motion-reduce:transition-none ${
              isActive
                ? "min-h-[580px] border-white/45 lg:min-h-0 lg:flex-[5]"
                : "min-h-20 border-white/10 hover:border-white/35 lg:min-h-0 lg:flex-[0.72]"
            }`}
          >
            <div className="absolute inset-0" aria-hidden="true">
              {demo.image ? (
                <img
                  src={demo.image}
                  alt=""
                  className={`h-full w-full object-cover transition duration-700 ${isActive ? "scale-100 opacity-45" : "scale-110 opacity-20 grayscale"}`}
                />
              ) : (
                <div className="h-full w-full grid-bg opacity-40" />
              )}
              <div className={`absolute inset-0 transition duration-500 ${isActive ? "bg-gradient-to-r from-black/95 via-black/80 to-black/35" : "bg-black/80"}`} />
            </div>

            <button
              type="button"
              onClick={() => onSelect(demo.id)}
              aria-expanded={isActive}
              aria-controls={`project-panel-${demo.id}`}
              className={`relative z-10 flex w-full items-center gap-4 p-5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                isActive ? "lg:absolute lg:inset-x-0 lg:top-0" : "h-full lg:flex-col lg:justify-between lg:py-7"
              }`}
            >
              <span className="font-mono text-[10px] font-bold tracking-[.2em] text-neutral-400">DEMO {demo.number}</span>
              <span className={`font-display text-xl font-bold normal-case text-white ${isActive ? "" : "lg:[writing-mode:vertical-rl] lg:rotate-180"}`}>
                {demo.title}
              </span>
              <span className={`ml-auto font-mono text-lg text-white transition-transform lg:ml-0 ${isActive ? "rotate-45" : ""}`} aria-hidden="true">+</span>
            </button>

            <div
              id={`project-panel-${demo.id}`}
              className={`relative z-0 flex h-full flex-col justify-end p-6 pt-24 transition duration-300 md:p-10 md:pt-28 ${
                isActive ? "visible translate-y-0 opacity-100" : "invisible translate-y-4 opacity-0"
              }`}
            >
              <div className="max-w-2xl">
                <span className="inline-flex border border-white/20 bg-black/50 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-neutral-300 backdrop-blur">
                  {demo.category}
                </span>
                <h3 className="mt-5 text-4xl font-black normal-case tracking-tight text-white md:text-6xl">{demo.title}</h3>
                <p className="mt-5 max-w-xl text-sm leading-6 text-neutral-200 md:text-base">{demo.description}</p>

                <div className="mt-6 max-w-xl border-l border-white/40 pl-4">
                  <p className="font-mono text-[9px] font-bold tracking-[.18em] text-neutral-500">SYSTEM_OUTPUT // IMPACT</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-300">{demo.impact}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
                  {demo.stack.map((technology) => (
                    <span key={technology} className="font-mono text-[9px] font-bold uppercase tracking-[.15em] text-neutral-400">{technology}</span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={demo.href} target={demo.href.startsWith("http") ? "_blank" : undefined} rel={demo.href.startsWith("http") ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-2 bg-white px-5 py-3 font-mono text-xs font-bold text-black transition hover:bg-neutral-200">
                    {demo.actionLabel} <ExternalLink size={15} />
                  </a>
                  {demo.source && demo.sourceLabel && (
                    <a href={demo.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/25 bg-black/40 px-5 py-3 font-mono text-xs font-bold text-white transition hover:border-white/70">
                      {demo.sourceLabel} <Github size={15} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
