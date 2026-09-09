import { getIdeaActual, listAgents, listIdeas } from "@/lib/memoria";
import { hasApiKey } from "@/lib/anthropic";
import Dashboard from "@/components/Dashboard";

export default async function Page() {
  const ideas = listIdeas();
  const current = getIdeaActual();
  const agents = listAgents();
  const apiKeyConfigured = hasApiKey();

  return (
    <Dashboard
      initialIdeas={ideas}
      initialCurrent={current}
      agents={agents}
      apiKeyConfigured={apiKeyConfigured}
    />
  );
}
