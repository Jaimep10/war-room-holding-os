"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatPanel from "@/components/ChatPanel";
import DeliverablesPanel from "@/components/DeliverablesPanel";
import { AgentSummary } from "@/lib/types";

export default function WarRoomPanel({
  agents,
  apiKeyConfigured,
}: {
  agents: AgentSummary[];
  apiKeyConfigured: boolean;
}) {
  return (
    <div className="col-span-1 rounded-xl border border-base-700 bg-base-900/60 p-4 flex flex-col overflow-hidden">
      <Tabs defaultValue="chat" className="flex flex-col h-full">
        <TabsList className="mb-3 self-start">
          <TabsTrigger value="chat">Chat Equipo</TabsTrigger>
          <TabsTrigger value="entregables">Entregables</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 overflow-hidden">
          <ChatPanel agents={agents} apiKeyConfigured={apiKeyConfigured} />
        </TabsContent>
        <TabsContent value="entregables" className="flex-1 overflow-hidden">
          <DeliverablesPanel apiKeyConfigured={apiKeyConfigured} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
