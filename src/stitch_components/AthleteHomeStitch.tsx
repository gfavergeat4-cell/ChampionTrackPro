import React, { useEffect } from "react";
import { Platform } from "react-native";

interface AthleteHomeProps {
  sessions?: Array<{ id: string; title: string; time: string; hasResponse?: boolean }>;
  onRespond?: (sessionId: string) => void;
  onOpenSession?: (sessionId: string) => void;
  onNavigateToTab?: (tabName: string) => void;
}

export default function AthleteHomeStitch({
  sessions = [
    { id: "1", title: "Morning Practice", time: "8:00 – 9:30 AM →", hasResponse: true },
    { id: "2", title: "Strength Training", time: "10:00 – 11:00 AM →", hasResponse: false }
  ],
  onRespond,
  onOpenSession,
  onNavigateToTab
}: AthleteHomeProps) {
  
  useEffect(() => {
    if (Platform.OS === "web") {
      // Set up global handlers for the HTML content
      (window as any).handleRespond = (sessionId: string) => {
        console.log("Respond clicked for session:", sessionId);
        onRespond?.(sessionId);
      };

      (window as any).handleSessionClick = (sessionId: string) => {
        console.log("Session clicked:", sessionId);
        onOpenSession?.(sessionId);
      };

      (window as any).navigateToTab = (tabName: string) => {
        console.log("Navigate to tab:", tabName);
        onNavigateToTab?.(tabName);
      };
    }
  }, [onRespond, onOpenSession, onNavigateToTab]);

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <div 
      style={{
        width: 375,
        height: 812,
        margin: 'auto',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}
      dangerouslySetInnerHTML={{
        __html: `
<!DOCTYPE html>
<html class="dark" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Home — Upcoming Sessions (Athlete v2, completed state).</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 300ms ease-out forwards; }
        .animate-slide-up { animation: slideUp 350ms ease-out forwards; }
        .card-glass {
             background: rgba(20, 26, 36, 0.5);
             backdrop-filter: blur(12px);
             -webkit-backdrop-filter: blur(12px);
             border: 1px solid rgba(0, 198, 255, 0.2);
             box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        .respond-button-glow {
            box-shadow: 0 0 15px rgba(0, 198, 255, 0.3), 0 0 10px rgba(0, 102, 255, 0.2);
        }
        .respond-button-glow:hover {
            box-shadow: 0 0 25px rgba(0, 198, 255, 0.5), 0 0 15px rgba(0, 102, 255, 0.4);
        }
        .tab-icon-glow { filter: drop-shadow(0 0 10px rgba(0, 224, 255, 0.8)); }
        .nav-bar-glass {
            background: rgba(10, 10, 10, 0.6);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .avatar-glow { box-shadow: 0 0 12px rgba(0, 224, 255, 0.4); }
        .checkmark-glow { filter: drop-shadow(0 0 8px #00FFAE); }
        .session-card { cursor: pointer; }
        .session-card:hover { transform: translateY(-2px); transition: transform 0.2s ease; }
        .respond-btn { cursor: pointer; }
        .respond-btn:hover { transform: scale(1.05); transition: transform 0.2s ease; }
        .nav-item { cursor: pointer; }
        .nav-item:hover { opacity: 0.8; }
    </style>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    fontFamily: { sans: ['Poppins', 'sans-serif'] },
                    colors: {
                        'platinum': '#E5E4E2',
                        'brand-cyan': '#00C6FF',
                        'brand-blue': '#0066FF',
                        'brand-pink': '#FF1D7C',
                        'brand-navy': '#0A0F1A',
                        'dark-blue': '#001E36',
                        'brand-gray': '#9AA3B2',
                        'gradient-gray-start': '#2C2F36',
                        'gradient-gray-end': '#3E414A',
                        'brand-green': '#00FFAE',
                    },
                }
            }
        }
    </script>
<style>
    body { min-height: max(884px, 100dvh); }
</style>
</head>
<body class="bg-gradient-to-b from-brand-navy to-dark-blue text-platinum font-sans">
<div class="relative flex flex-col min-h-screen w-full max-w-md mx-auto overflow-hidden">
<div class="absolute top-0 left-0 w-72 h-72 bg-brand-cyan/15 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
<div class="absolute -bottom-16 right-0 w-80 h-80 bg-brand-blue/30 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
<div class="absolute top-12 right-6 z-20">
<img alt="Athlete Profile Picture" class="w-9 h-9 rounded-full border-2 border-brand-cyan/60 object-cover avatar-glow" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7VDqipPFovwX9YNDC53nyUMqSQWMr4m0yVMk825OEedGvJt-xtgDZgb9g9RU_FhyHiNan9fObFvT8ZvK46xuMxDvu-o65ezWS1Lpq4bly_yCl_2xe55lmf_pjSRWAyVuG1wnld0bpXTcYVmrkTD98MozBtXb3ntUGQgBgug4Clmp52RxrnMSpRwNkfVpDyCaFZOQo_iR-mjj3iR-HpccEmBs37mussebmkn-h-Z12e9Ci2w2qWL3VpmfE8v4QI_8NcmavPD07aKU"/>
</div>
<div class="flex-grow px-6 pt-12 z-10">
<header class="mb-8 animate-fade-in" style="animation-delay: 100ms;">
<h1 class="text-2xl font-bold tracking-tighter uppercase">WELCOME BACK</h1>
<p class="text-sm text-platinum/80 uppercase tracking-wide">Here are your upcoming sessions.</p>
</header>
<main>
<div class="text-center mb-6 animate-fade-in" style="animation-delay: 200ms;">
<h2 class="text-xs font-semibold tracking-widest text-platinum/90 uppercase">Upcoming Sessions</h2>
<p class="text-xs text-platinum/70">Your next training events.</p>
</div>
<div class="space-y-3">
${sessions.map((session, index) => `
<div class="card-glass rounded-2xl px-4 py-3 opacity-0 animate-slide-up session-card" style="animation-delay: ${300 + index * 100}ms;" onclick="handleSessionClick('${session.id}')">
<div class="flex justify-between items-center">
<div class="flex-1">
<p class="text-xs text-platinum/70 mb-1">${session.time}</p>
<h3 class="text-base font-semibold tracking-tight">${session.title}</h3>
</div>
<div class="relative ml-4">
${session.hasResponse ? `
<div class="flex items-center text-sm font-semibold text-white bg-gradient-to-r from-gradient-gray-start to-gradient-gray-end rounded-full pl-5 pr-4 py-2.5">
<span>Completed</span>
<svg class="w-4 h-4 ml-1.5 text-brand-green checkmark-glow" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill-rule="evenodd"></path></svg>
</div>
` : `
<button class="text-sm font-semibold text-white bg-gradient-to-r from-brand-cyan to-brand-blue rounded-full px-5 py-2.5 respond-button-glow transition-shadow duration-300 respond-btn" onclick="event.stopPropagation(); handleRespond('${session.id}')">
Respond
</button>
<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-pink rounded-full border-2 border-brand-navy"></div>
`}
</div>
</div>
</div>
`).join('')}
</div>
</main>
</div>
<footer class="sticky bottom-0 w-full nav-bar-glass z-20">
<nav class="flex justify-around items-center h-20">
<a class="flex flex-col items-center gap-1 text-brand-cyan relative nav-item" href="#" onclick="event.preventDefault(); navigateToTab('Home')">
<svg class="w-7 h-7 tab-icon-glow" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"></path></svg>
<div class="absolute -bottom-2.5 h-1 w-8 bg-brand-cyan rounded-full tab-icon-glow"></div>
</a>
<a class="flex flex-col items-center gap-1 text-brand-gray hover:text-white transition-colors nav-item" href="#" onclick="event.preventDefault(); navigateToTab('Calendar')">
<svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"></path></svg>
</a>
<a class="flex flex-col items-center gap-1 text-brand-gray hover:text-white transition-colors nav-item" href="#" onclick="event.preventDefault(); navigateToTab('Stats')">
<svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 13.5l4-4 4 4L17.5 7 21 10.5M3 3v18h18" stroke-linecap="round" stroke-linejoin="round"></path></svg>
</a>
<a class="flex flex-col items-center gap-1 text-brand-gray hover:text-white transition-colors nav-item" href="#" onclick="event.preventDefault(); navigateToTab('Profile')">
<svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round"></path></svg>
</a>
</nav>
</footer>
</div>
</body>
</html>
        `
      }}
    />
  );
}




