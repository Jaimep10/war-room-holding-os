"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatPanel from "@/components/ChatPanel";
import DeliverablesPanel from "@/components/DeliverablesPanel";
import { AgentSummary } from "@/lib/types";

export default function WarRoomPanel({
  agents,
  apiKeyConfigured,
  projectId,
  projectLabel,
}: {
  agents: AgentSummary[];
  apiKeyConfigured: boolean;
  projectId: string | null;
  projectLabel?: string | null;
}) {
  return (
    <div className="col-span-1 rounded-xl border border-base-700 bg-base-900/60 p-4 flex flex-col overflow-hidden">
      <Tabs defaultValue="chat" className="flex flex-col h-full">
        <TabsList className="mb-3 self-start">
          <TabsTrigger value="chat">Chat Equipo</TabsTrigger>
          <TabsTrigger value="entregables">Entregables</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 overflow-hidden">
          <ChatPanel
            agents={agents}
            apiKeyConfigured={apiKeyConfigured}
            projectId={projectId}
            projectLabel={projectLabel}
          />
        </TabsContent>
        <TabsContent value="entregables" className="flex-1 overflow-hidden">
          <DeliverablesPanel apiKeyConfigured={apiKeyConfigured} projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
