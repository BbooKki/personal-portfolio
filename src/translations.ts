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
      location: "Open to new roles in Seoul",
      title: "Web, mobile and AI products for real users.",
      subtitle: "Hi, I'm Dylan Islom, a frontend engineer for web and mobile. I build public healthcare apps and admin systems, connect BLE devices, and work with agentic AI tools.",
      ctaProjects: "View Projects",
      ctaCv: "Download CV"
    },
    about: {
      title: "Professional Summary",
      p1: "I am a software engineer with about five years of experience at companies in Uzbekistan, Russia and Korea. I started with backend CRM systems and now work as the main app and web frontend developer at a healthcare software company in Seoul.",
      p2: "I hold a Master's in AI & Convergence with a computer vision focus; my thesis detected driver drowsiness with YOLO. Today I build Vue 3, TypeScript and Flutter apps, and I set up the agentic AI workflow my team uses.",
      stats: {
        experience: "Years Experience",
        countries: "Countries (employers)",
        healthcareApps: "Languages Spoken",
        stabilityMonitoring: "On-Device AI Demos"
      }
    },
    skills: {
      title: "Skills",
      subtitle: "Tools I use in day-to-day work."
    },
    projects: {
      title: "Live Demos",
      subtitle: "Two working demos you can try in the browser.",
      visit: "Visit Site",
      confidential: "Confidential Project",
      githubTitle: "GitHub",
      githubDesc: "Most of my work code belongs to my employers. Personal projects and experiments are on my GitHub.",
      aiDemo: {
        category: "Private On-Device AI",
        description: "Ask technical questions about my experience, projects, and architecture decisions through a focused portfolio assistant running locally in your browser.",
        impact: "Runs Gemma 4 E2B through LiteRT-LM, WebGPU, and a dedicated Web Worker so prompts stay on the visitor's device.",
        visit: "Start Private Chat"
      },
      cvCopilot: {
        category: "AI / Developer Tools",
        description: "A privacy-conscious CV editor that compares real experience with a target role, proposes reviewable improvements, and exports polished PDFs.",
        impact: "Suggestions stay reviewable and reversible. Includes local Gemma inference, job-page extraction, print-ready templates and optional cloud saving with Supabase.",
        visit: "Try Demo 02",
        source: "View Source"
      }
    },
    experience: {
      title: "Professional Experience",
      items: [
        {
          role: "Main App & Web Frontend Developer",
          points: [
            "Build the Vue 3 + TypeScript admin web and Flutter apps for two public healthcare programs and the Health&You app.",
            "Built role-based access control, health-data charts and a batch-job monitoring dashboard.",
            "Stabilized BLE wearable pairing and wrote app and web tests; set up Sentry and Crashlytics error tracking."
          ]
        },
        {
          role: "Full Stack Developer",
          points: [
            "Built a NestJS monorepo system with GraphQL and REST APIs (remote).",
            "Developed cross-platform Flutter apps with Native Bridges for BLE communication.",
            "Automated backend workflows on Ubuntu VPS using Docker and NGINX."
          ]
        },
        {
          role: "Backend Developer",
          points: [
            "Developed CRM/ERP systems for internal financial operations.",
            "Designed REST APIs with MVC for financial data modeling.",
            "Implemented JWT/BcryptJS authentication and Socket.IO sync."
          ]
        }
      ]
    },
    contact: {
      title: "Get in touch.",
      subtitle: "Open to frontend, mobile and full-stack roles, including AI-related work.",
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
      title: "실제 사용자를 위한 웹·앱·AI 서비스를 만듭니다.",
      subtitle: "안녕하세요, 딜란(Islom)입니다. 웹·앱 프론트엔드 개발자로 공공 헬스케어 앱과 관리자 시스템을 만들고, BLE 기기 연동과 에이전틱 AI 도구를 다룹니다.",
      ctaProjects: "프로젝트 보기",
      ctaCv: "이력서 다운로드"
    },
    about: {
      title: "소개",
      p1: "우즈베키스탄, 러시아, 한국 회사에서 약 5년간 일한 소프트웨어 엔지니어입니다. 백엔드 CRM 개발로 시작해, 지금은 서울의 헬스케어 소프트웨어 회사에서 앱·웹 프론트엔드를 맡고 있습니다.",
      p2: "AI융합 석사(컴퓨터 비전 전공)를 마쳤고, 학위논문에서 YOLO로 운전자 졸음을 감지했습니다. 현재 Vue 3, TypeScript, Flutter로 서비스를 개발하며, 팀이 함께 쓰는 에이전틱 AI 개발 환경을 정비하고 있습니다.",
      stats: {
        experience: "경력 연수",
        countries: "근무 회사 국가",
        healthcareApps: "사용 언어",
        stabilityMonitoring: "온디바이스 AI 데모"
      }
    },
    skills: {
      title: "기술 스택",
      subtitle: "실무에서 사용하는 도구입니다."
    },
    projects: {
      title: "라이브 데모",
      subtitle: "브라우저에서 바로 사용해 볼 수 있는 데모 2개입니다.",
      visit: "사이트 방문",
      confidential: "기밀 프로젝트",
      githubTitle: "GitHub",
      githubDesc: "업무 코드는 대부분 회사 소유입니다. 개인 프로젝트와 실험은 GitHub에 있습니다.",
      aiDemo: {
        category: "프라이빗 온디바이스 AI",
        description: "브라우저에서 로컬로 실행되는 포트폴리오 어시스턴트를 통해 경력, 프로젝트 및 아키텍처 결정에 관한 기술 질문을 할 수 있습니다.",
        impact: "Gemma 4 E2B를 LiteRT-LM, WebGPU 및 전용 Web Worker로 실행하여 방문자의 프롬프트가 기기 밖으로 나가지 않도록 합니다.",
        visit: "프라이빗 채팅 시작"
      },
      cvCopilot: {
        category: "AI / 개발자 도구",
        description: "실제 경력을 목표 직무와 비교해 검토 가능한 개선안을 제안하고, PDF로 내보내는 개인정보 보호 중심 이력서 편집기입니다.",
        impact: "제안은 검토하고 되돌릴 수 있습니다. 로컬 Gemma 추론, 채용 공고 추출, 인쇄용 템플릿, Supabase 기반 선택적 클라우드 저장을 포함합니다.",
        visit: "데모 02 체험",
        source: "소스 보기"
      }
    },
    experience: {
      title: "업무 경력",
      items: [
        {
          role: "앱·웹 프론트엔드 개발",
          points: [
            "공공 헬스케어 사업 2곳과 Health&You 앱의 Vue 3 + TypeScript 관리자 웹과 Flutter 앱을 개발합니다.",
            "역할 기반 접근 제어, 건강 데이터 차트, 배치 작업 모니터링 대시보드를 개발했습니다.",
            "BLE 웨어러블 페어링을 안정화하고 앱·웹 테스트를 작성했으며, Sentry와 Crashlytics로 오류를 추적합니다."
          ]
        },
        {
          role: "풀스택 개발자",
          points: [
            "GraphQL·REST API를 갖춘 NestJS 모노레포 시스템을 개발했습니다(원격 근무).",
            "저지연 BLE 통신을 위한 네이티브 브리지(Kotlin/Swift)가 포함된 크로스 플랫폼 Flutter 앱을 개발했습니다.",
            "Docker 및 NGINX를 사용하여 Ubuntu VPS에서 백엔드 워크플로우를 자동화했습니다."
          ]
        },
        {
          role: "백엔드 개발자",
          points: [
            "사내 금융 업무를 위한 CRM/ERP 시스템을 개발했습니다.",
            "MVC 구조로 금융 데이터 모델링용 REST API를 설계했습니다.",
            "JWT·BcryptJS 인증과 Socket.IO 실시간 동기화를 구현했습니다."
          ]
        }
      ]
    },
    contact: {
      title: "연락하기",
      subtitle: "프론트엔드, 모바일, 풀스택 직무(AI 관련 업무 포함)를 찾고 있습니다.",
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
