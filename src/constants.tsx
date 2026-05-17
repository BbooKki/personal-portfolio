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

export const PROJECTS = [
  {
    title: "Flowshop.uz",
    category: "E-Commerce",
    description: "A feature-rich e-commerce platform for limited clothing, featuring real-time chat and advanced filtering.",
    stack: ["NestJS", "GraphQL", "MongoDB", "Next.js", "WebSocket"],
    impact: "Built with MVR architecture, delivering <100ms response times for 20k+ SKUs.",
    link: "http://theflowuz.shop",
    image: "/flowshop.png",
    isCaseStudy: true
  },
  {
    title: "Our Petstore",
    category: "E-Commerce / MVC",
    description: "Multi-vendor pet marketplace with robust order management and administrative dashboard.",
    stack: ["Express.js", "MongoDB", "Redux", "Socket.io", "Docker"],
    impact: "Implemented complex financial data modeling and real-time order tracking.",
    link: "http://168.231.123.112:3001",
    image: "/petstore.png",
    isCaseStudy: true
  }
];

export const EXPERIENCE = [
  {
    company: "The Join",
    location: "Seoul, Korea",
    role: "Mobile Developer",
    period: "2025.07 - Present",
    points: [
      "Architected modular Flutter system with 15+ modules for a healthcare ecosystem.",
      "Integrated AI health analytics and real-time social features.",
      "Maintained high-traffic Vue.js 3 site for 230k users."
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
      "Developed high-performance CRM/ERP systems increasing operational efficiency by 30%.",
      "Designed scalable RESTful APIs using MVC architecture for financial modeling.",
      "Implemented robust JWT/BcryptJS authentication and Socket.IO synchronization."
    ]
  }
];

export const SKILLS = [
  {
    category: "Backend",
    icon: "Backend",
    tags: ["Node.js", "NestJS", "Express", "TypeScript", "Java", "Spring Boot", "Python"]
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
    tags: ["AI Health Analytics", "Gemini API", "OpenAI", "MongoDB Aggregation", "Socket.IO"]
  }
];
