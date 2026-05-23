'use client';

import React, { useState } from 'react';
import { useOrchestrator } from '@/app/demo/_providers/OrchestratorProvider';
import { motion } from 'motion/react';

// Modular Components
import DashboardHeader from '@/app/demo/_components/DashboardHeader';
import AgentWorkspace from '@/app/demo/_components/AgentWorkspace';
import ChatOrchestrator from '@/app/demo/_components/ChatOrchestrator';
import AgentFormModal from '@/app/demo/_components/AgentFormModal';


const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export default function DemoPage() {
  const {
    goal,
    setGoal,
    running,
    pipelineLogs,
    errorText,
    currentStepInfo,
    startPipeline,
    resetPipeline,
    customAgents,
    addCustomAgent,
    updateCustomAgent,
    deleteCustomAgent,
    loadPresets,
    agents,
    runSingleAgent,
    finalSummary,
    sessions,
    activeSessionId,
    setActiveSessionId,
    deleteSession,
    ledger,
  } = useOrchestrator();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingAgent = customAgents.find((a) => a.id === editingId) || null;

  const handleStartEdit = (agent: any) => {
    setEditingId(agent.id);
    setShowAddForm(false);
  };

  const handleModalClose = () => {
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleFormSubmit = (data: {
    name: string;
    role: string;
    vendorSlug: string;
    prompt: string;
  }) => {
    if (editingId) {
      updateCustomAgent(editingId, data);
      setEditingId(null);
    } else {
      addCustomAgent(data);
      setShowAddForm(false);
    }
  };



  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <DashboardHeader
        running={running}
        customAgentsLength={customAgents.length}
      />

      {/* Top Section: Agent Workspace */}
      <div className="w-full">
        <AgentWorkspace
          customAgents={customAgents}
          running={running}
          loadPresets={loadPresets}
          runSingleAgent={runSingleAgent}
          handleStartEdit={handleStartEdit}
          deleteCustomAgent={deleteCustomAgent}
          triggerAddForm={() => {
            setEditingId(null);
            setShowAddForm(true);
          }}
        />
      </div>





      {/* Bottom Section: SSE Chat Stream Interface */}
      <ChatOrchestrator
        goal={goal}
        running={running}
        pipelineLogs={pipelineLogs}
        errorText={errorText}
        currentStepInfo={currentStepInfo}
        startPipeline={startPipeline}
        resetPipeline={resetPipeline}
        agents={agents}
        finalSummary={finalSummary}
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        deleteSession={deleteSession}
        ledger={ledger}
        setGoal={setGoal}
      />

      {/* Modal for Add / Edit */}
      <AgentFormModal
        isOpen={showAddForm || !!editingId}
        editingAgent={editingAgent}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
      />
    </motion.div>
  );
}
