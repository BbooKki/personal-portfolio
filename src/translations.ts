export const translations = {
  en: {
    nav: {
      about: "About",
      skills: "Skills",
      projects: "Projects",
      experience: "Experience",
      contact: "Contact Me"
    },
    hero: {
      location: "Available for new impact in Seoul",
      title: "Building Robust Systems & Seamless Apps.",
      subtitle: "Hi, I'm Dylan Islom. A Full-Stack Engineer specializing in backend architecture, product strategy, and scalable mobile ecosystems.",
      ctaProjects: "View Projects",
      ctaCv: "Download CV"
    },
    about: {
      title: "Professional Summary",
      p1: "I am a Software Engineer with 5+ years of cross-border experience. My path has taken me from building financial CRM systems to architecting complex healthcare ecosystems in the heart of Seoul.",
      p2: "With a Master's in AI & Convergence (computer vision focus), I bridge the gap between traditional backend reliability and modern intelligent systems. I don't just write code; I design systems that scale and solve real-world problems.",
      stats: {
        experience: "Years Experience",
        countries: "Countries Worked In",
        healthcareApps: "Healthcare Apps Shipped",
        stabilityMonitoring: "Stability Monitoring"
      }
    },
    skills: {
      title: "Technical Arsenal",
      subtitle: "A focused stack optimized for performance, scalability, and maintainability."
    },
    projects: {
      title: "Live Demos",
      subtitle: "Explore live, continuously deployed applications showcasing real-world architecture, performance, and product engineering.",
      visit: "Visit Site",
      confidential: "Confidential Project",
      githubTitle: "Active Open Source",
      githubDesc: "I regularly contribute to several internal toolings and maintain a presence on GitHub with various experimentation projects in AI and architecture.",
      items: [
        {
          category: "E-Commerce",
          description: "A feature-rich e-commerce platform for limited clothing, featuring real-time chat and advanced filtering.",
          impact: "NestJS + GraphQL API with JWT authentication, products, comments, likes and follows, powering a Next.js storefront with signup, My Page and admin views."
        }
      ],
      aiDemo: {
        category: "Private On-Device AI",
        description: "Ask technical questions about my experience, projects, and architecture decisions through a focused portfolio assistant running locally in your browser.",
        impact: "Runs Gemma 4 E2B through LiteRT-LM, WebGPU, and a dedicated Web Worker so prompts stay on the visitor's device.",
        visit: "Start Private Chat"
      },
      cvCopilot: {
        category: "AI / Developer Tools",
        description: "A privacy-conscious CV editor that compares real experience with a target role, proposes reviewable improvements, and exports polished PDFs.",
        impact: "Built truthful, reversible AI workflows with local Gemma inference, guarded job-page extraction, four shared-schema templates, and optional cloud persistence.",
        visit: "Try Demo 03",
        source: "View Source"
      }
    },
    experience: {
      title: "Professional Experience",
      items: [
        {
          role: "Mobile Developer",
          points: [
            "Architected a modular Flutter (Clean Architecture) system for a digital healthcare ecosystem.",
            "Integrated AI health analytics and real-time social features.",
            "Built and maintained Vue.js 3 + TypeScript admin web consoles for public healthcare services."
          ]
        },
        {
          role: "Full Stack Developer",
          points: [
            "Engineered production-grade NestJS monorepo systems with hybrid GraphQL/REST APIs.",
            "Developed cross-platform Flutter apps with Native Bridges for BLE communication.",
            "Automated backend workflows on Ubuntu VPS using Docker and NGINX."
          ]
        },
        {
          role: "Backend Developer",
          points: [
            "Developed CRM/ERP systems for internal financial operations.",
            "Designed scalable RESTful APIs using MVC architecture for financial modeling.",
            "Implemented robust JWT/BcryptJS authentication and Socket.IO synchronization."
          ]
        }
      ]
    },
    contact: {
      title: "Let's build the future of tech together.",
      subtitle: "Currently open to challenging roles in mobile, frontend architecture, backend architecture, full-stack development, and AI engineering.",
      emailMe: "Email Me",
      location: "Location",
      form: {
        name: "Name",
        email: "Email",
        message: "Message",
        send: "Send Message"
      }
    }
  },
  ko: {
    nav: {
      about: "소개",
      skills: "기술",
      projects: "프로젝트",
      experience: "경력",
      contact: "문의하기"
    },
    hero: {
      location: "서울에서 새로운 도전을 준비 중입니다",
      title: "견고한 시스템과 완벽한 앱을 구축합니다.",
      subtitle: "안녕하세요, 딜란(Islom)입니다. 백엔드 아키텍처, 제품 전략 및 확장 가능한 모바일 생태계를 전문으로 하는 풀스택 엔지니어입니다.",
      ctaProjects: "프로젝트 보기",
      ctaCv: "이력서 다운로드"
    },
    about: {
      title: "전문가 요약",
      p1: "저는 5년 이상의 글로벌 경험을 가진 소프트웨어 엔지니어입니다. 금융 CRM 시스템 구축부터 서울 중심부의 복잡한 의료 생태계 아키텍처 설계까지 다양한 프로젝트를 수행해 왔습니다.",
      p2: "AI융합 석사(컴퓨터 비전 전공)로서, 전통적인 백엔드의 안정성과 현대적인 지능형 시스템 사이의 가교 역할을 합니다. 단순히 코드를 작성하는 것이 아니라, 확장 가능하고 실제 문제를 해결하는 시스템을 설계합니다.",
      stats: {
        experience: "경력 연수",
        countries: "근무 국가",
        healthcareApps: "출시한 헬스케어 앱",
        stabilityMonitoring: "안정성 모니터링"
      }
    },
    skills: {
      title: "기술 스택",
      subtitle: "성능, 확장성 및 유지보수성에 최적화된 기술 스택입니다."
    },
    projects: {
      title: "라이브 데모",
      subtitle: "실제 아키텍처, 성능 및 제품 엔지니어링을 보여주는 지속적으로 배포되는 라이브 애플리케이션을 살펴보세요.",
      visit: "사이트 방문",
      confidential: "기밀 프로젝트",
      githubTitle: "활발한 오픈 소스 활동",
      githubDesc: "여러 내부 툴링에 정기적으로 기여하고 있으며, AI 및 아키텍처 실험 프로젝트를 통해 GitHub에서 활발히 활동하고 있습니다.",
      items: [
        {
          category: "이커머스",
          description: "실시간 채팅 및 고급 필터링 기능을 갖춘 한정판 의류 이커머스 플랫폼입니다.",
          impact: "JWT 인증, 상품·댓글·좋아요·팔로우 기능을 갖춘 NestJS + GraphQL API와 회원가입, 마이페이지, 관리자 화면을 제공하는 Next.js 스토어프론트입니다."
        }
      ],
      aiDemo: {
        category: "프라이빗 온디바이스 AI",
        description: "브라우저에서 로컬로 실행되는 포트폴리오 어시스턴트를 통해 경력, 프로젝트 및 아키텍처 결정에 관한 기술 질문을 할 수 있습니다.",
        impact: "Gemma 4 E2B를 LiteRT-LM, WebGPU 및 전용 Web Worker로 실행하여 방문자의 프롬프트가 기기 밖으로 나가지 않도록 합니다.",
        visit: "프라이빗 채팅 시작"
      },
      cvCopilot: {
        category: "AI / 개발자 도구",
        description: "실제 경력을 목표 직무와 비교하고, 검토 가능한 개선안을 제안하며, 완성도 높은 PDF를 내보내는 개인정보 보호 중심 CV 편집기입니다.",
        impact: "로컬 Gemma 추론, 안전한 채용 공고 추출, 공통 스키마 기반 4개 템플릿, 선택적 클라우드 저장을 갖춘 진실하고 되돌릴 수 있는 AI 워크플로를 구축했습니다.",
        visit: "데모 03 체험",
        source: "소스 보기"
      }
    },
    experience: {
      title: "업무 경력",
      items: [
        {
          role: "모바일 개발자",
          points: [
            "디지털 헬스케어 서비스를 위한 모듈형 Flutter(클린 아키텍처) 시스템을 설계했습니다.",
            "AI 건강 분석 및 실시간 소셜 기능을 통합했습니다.",
            "공공 헬스케어 서비스의 Vue.js 3 + TypeScript 관리자 웹을 개발하고 유지보수했습니다."
          ]
        },
        {
          role: "풀스택 개발자",
          points: [
            "하이브리드 GraphQL/REST API를 갖춘 상용 등급의 NestJS 모노레포 시스템을 구축했습니다.",
            "저지연 BLE 통신을 위한 네이티브 브리지(Kotlin/Swift)가 포함된 크로스 플랫폼 Flutter 앱을 개발했습니다.",
            "Docker 및 NGINX를 사용하여 Ubuntu VPS에서 백엔드 워크플로우를 자동화했습니다."
          ]
        },
        {
          role: "백엔드 개발자",
          points: [
            "사내 금융 업무를 위한 CRM/ERP 시스템을 개발했습니다.",
            "재무 데이터 모델링 및 분석을 위해 MVC 아키텍처를 사용한 확장 가능한 RESTful API를 설계했습니다.",
            "JWT 및 BcryptJS를 사용한 강력한 인증 프레임워크와 실시간 동기화를 위한 Socket.IO를 구현했습니다."
          ]
        }
      ]
    },
    contact: {
      title: "기술의 미래를 함께 만들어갑시다.",
      subtitle: "현재 모바일, 프론트엔드 아키텍처, 백엔드 아키텍처, 풀스택 개발 및 AI 엔지니어링 분야의 도전적인 직무를 찾고 있습니다.",
      emailMe: "이메일 문의",
      location: "위치",
      form: {
        name: "이름",
        email: "이메일",
        message: "메시지",
        send: "메시지 전송"
      }
    }
  }
};

export type Language = "en" | "ko";
