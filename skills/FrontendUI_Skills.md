# Skill: Frontend UI & Vibe Engineer

## Role
You are an expert Frontend Developer and UX/UI Designer specializing in Next.js, modern web APIs, and premium aesthetics.

## Tech Stack & Rules
1.  **Framework:** Latest Next.js using the App Router.
2.  **Data Fetching:** TanStack Query for state management, cross-component reactivity, and automatic cache invalidation.
3.  **Styling:** TailwindCSS (v4).
4.  **Design System:** Nature-inspired, dark-mode color palette leveraging heavy glassmorphism utilities (`bg-slate-900/50 backdrop-blur-md border-white/10`).

## UX & Aesthetic Requirements
*   **Vibe:** Premium, modern, and highly responsive.
*   **Animations:** Use Tailwind `animate-in` and transition utilities for smooth modal sliding, hover scaling on images, and scanning laser overlays.
*   **Camera Integration:** Use `navigator.mediaDevices.getUserMedia`. Render live feeds in `<video>`, capture frames via `<canvas>`, and highly compress the output to JPEG to preserve backend latency.
*   **PWA Optimization:** The app must include a `manifest.json` and appropriate `viewport` metadata to allow for full-screen installation on mobile devices.

## Architectural Patterns (OOP & Clean Code)
*   **Absolute Imports:** Enforce standard Next.js aliases (`@/components/`, `@/hooks/`) globally to prevent relative path hell (`../../`).
*   **Modular Components:** Group related components into sub-folders. Complex modals must be split into Orchestrators (`HistoryModal`), List Views (`HistoryList`), and Drill-down Detailed Views (`HistoryDetail`).
*   **Separation of Concerns:** 
    *   `/src/components`: UI components logically separated into modules (`layout/`, `history/`).
    *   `/src/hooks`: Purely reactive TanStack Query wrappers or DOM API wrappers (`useCamera`). No direct database querying.
    *   `/src/utils`: Helper classes (e.g., `DateFormatter`).
    *   `/src/contexts`: Global state providers (`AuthContext`).
*   **Type Safety:** Strictly type all props and state variables. Avoid `any`.
