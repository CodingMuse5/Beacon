import { GithubIntelligencePanel } from "./components/GithubIntelligencePanel";
import { Hero } from "./components/Hero";
import { JobAnalyzePanel } from "./components/JobAnalyzePanel";
import { ResumeUploadPanel } from "./components/ResumeUploadPanel";
import { TopBar } from "./components/TopBar";

export default function App() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Hero />
      <main id="console" className="mx-auto max-w-7xl scroll-mt-20 px-8 pb-32">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-faint">— The console</p>
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <ResumeUploadPanel />
          <JobAnalyzePanel />
          <GithubIntelligencePanel />
        </div>
      </main>
    </div>
  );
}
