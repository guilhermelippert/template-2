import { AnalyticsProvider } from "@/lib/contexts/AnalyticsContext";
import StepManager from "@/components/StepManager";

export default function Home() {
  return (
    <AnalyticsProvider>
      <main className="min-h-screen bg-gray-50">
        <StepManager />
      </main>
    </AnalyticsProvider>
  );
}
