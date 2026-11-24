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
    role: "Mobile Developer",
    period: "2025.07 - Present",
    points: [
      "Architected a modular Flutter (Clean Architecture) system for a digital healthcare ecosystem.",
      "Integrated AI health analytics and real-time social features.",
      "Built and maintained Vue.js 3 + TypeScript admin web consoles for public healthcare services."
    ]
  },
  {
    company: "Innovatech Development",
    location: "Moscow, Russia",
    role: "Full Stack Developer",
    period: "2022.10 - 2025.02",
    points: [
      "Engineered production-grade NestJS monorepo systems with hybrid GraphQL/REST APIs.",
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
      "Designed scalable RESTful APIs using MVC architecture for financial modeling.",
      "Implemented robust JWT/BcryptJS authentication and Socket.IO synchronization."
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
    tags: ["AI Health Analytics", "Gemini API", "OpenAI", "PyTorch", "YOLO", "MongoDB Aggregation", "Socket.IO"]
  }
];
