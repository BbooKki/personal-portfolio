import { motion } from "motion/react";
import React, { ReactNode } from "react";

interface SectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, title, subtitle, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`py-20 px-6 md:px-12 lg:px-24 relative overflow-hidden bg-black ${className}`}>
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            {title && <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tighter">{title}</h2>}
            {subtitle && <p className="text-neutral-500 text-lg max-w-2xl font-mono leading-relaxed">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string; key?: string | number }) {
  return (
    <span className={`px-3 py-1 text-[10px] font-mono font-bold rounded-sm border uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string; key?: string | number }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      className={`glass rounded-xl p-8 glow-border transition-all duration-300 group overflow-hidden relative ${className}`}
    >
      <div className="absolute inset-0 grid-bg-fine opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" />
      {children}
    </motion.div>
  );
}

export function Button({ 
  children, 
  variant = 'primary', 
  className = "", 
  ...props 
}: (
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement>
) & { variant?: 'primary' | 'secondary' | 'outline' }) {
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/50",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700 shadow-lg border border-white/5",
    outline: "border border-white/10 text-white hover:bg-white/5 hover:border-white/20"
  };

  const buttonClassName = `px-8 py-3 rounded-sm font-mono text-sm font-bold uppercase tracking-widest transition-all active:scale-95 ${variants[variant]} ${className}`;

  if ("href" in props && typeof props.href === "string") {
    return (
      <a
        className={buttonClassName}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button 
      className={buttonClassName}
      {...props}
    >
      {children}
    </button>
  );
}
