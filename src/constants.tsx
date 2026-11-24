import { 
  Code2, 
  Smartphone, 
  Layers, 
  Cloud, 
  Cpu, 
  Zap, 
  Globe, 
  Database, 
  Terminal,
  Github,
  Linkedin,
  Mail,
  Download,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  MapPin,
  Calendar
} from "lucide-react";

export const ICONS = {
  Backend: Code2,
  Mobile: Smartphone,
  Frontend: Globe,
  DevOps: Cloud,
  AI: Cpu,
  Database: Database,
  Patterns: Layers,
  Tooling: Terminal,
  GitHub: Github,

  Mail: Mail,
  Download: Download,
  External: ExternalLink,
  Arrow: ChevronRight,
  Menu,
  Close: X,
  Map: MapPin,
  Calendar
};

export const CV_COPILOT_DEMO = {
  title: "CV Copilot",
  demoNumber: "02",
  stack: ["React", "TypeScript", "Gemma", "WebGPU", "Supabase"],
  link: "https://cv-copilot-lovat.vercel.app",
  source: "https://github.com/BbooKki/cv-copilot",
  image: "/cv-copilot.png",
} as const;

export const EXPERIENCE = [
  {
    company: "The Join",
    location: "Seoul, Korea",
    role: "Main App & Web Frontend Developer",
    period: "2025.07 - Present",
    points: [
      "Build the Vue 3 + TypeScript admin web and Flutter apps for two public healthcare programs and the Health&You app.",
      "Built role-based access control, health-data charts and a batch-job monitoring dashboard.",
      "Stabilized BLE wearable pairing and wrote app and web tests; set up Sentry and Crashlytics error tracking."
    ]
  },
  {
    company: "Innovatech Development",
    location: "Moscow, Russia (remote)",
    role: "Full Stack Developer",
    period: "2022.10 - 2025.02",
    points: [
      "Built a NestJS monorepo system with GraphQL and REST APIs.",
      "Developed cross-platform Flutter apps with Native Bridges for BLE communication.",
      "Automated backend workflows on Ubuntu VPS using Docker and NGINX."
    ]
  },
  {
    company: "Atlantis Investment",
    location: "Tashkent, Uzbekistan",
    role: "Backend Developer",
    period: "2021.02 - 2022.10",
    points: [
      "Developed CRM/ERP systems for internal financial operations.",
      "Designed REST APIs with MVC for financial data modeling.",
      "Implemented JWT/BcryptJS authentication and Socket.IO sync."
    ]
  }
];

export const SKILLS = [
  {
    category: "Backend",
    icon: "Backend",
    tags: ["Node.js", "NestJS", "Express", "TypeScript", "Python"]
  },
  {
    category: "Mobile",
    icon: "Mobile",
    tags: ["Flutter", "Dart", "GetX", "Clean Architecture", "Native Bridges (Kotlin/Swift)"]
  },
  {
    category: "Frontend",
    icon: "Frontend",
    tags: ["Vue.js 3", "React", "Next.js", "Redux", "Tailwind CSS", "GraphQL"]
  },
  {
    category: "Cloud / DevOps",
    icon: "DevOps",
    tags: ["Docker", "NGINX", "Jenkins", "CI/CD", "VPS Deployment", "VPC", "Firewalls"]
  },
  {
    category: "AI & Tools",
    icon: "AI",
    tags: ["PyTorch", "YOLO", "Roboflow", "Gemini API", "LiteRT-LM / WebGPU", "Claude Code", "Codex"]
  }
];
