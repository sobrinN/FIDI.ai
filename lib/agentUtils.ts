/**
 * Agent Utilities
 * Helper functions for agent validation and synchronization
 */

import { AGENTS } from '../config/agents';
import { AgentId } from '../config/constants';

/**
 * Validates and returns a valid agent ID
 * Falls back to '01' (FIDI) if invalid or not found
 */
export const getValidAgentId = (agentId?: string): keyof typeof AGENTS => {
  if (agentId && AGENTS[agentId as keyof typeof AGENTS]) {
    return agentId as keyof typeof AGENTS;
  }
  return '01'; // Default to FIDI
};

/**
 * Checks if an agent ID is valid
 */
export const isValidAgentId = (agentId: string): agentId is keyof typeof AGENTS => {
  return agentId in AGENTS;
};

/**
 * Gets agent configuration by ID
 * Returns undefined if agent not found
 */
export const getAgentById = (agentId: string) => {
  if (isValidAgentId(agentId)) {
    return AGENTS[agentId];
  }
  return undefined;
};

/**
 * Gets all available agent IDs
 */
export const getAllAgentIds = (): Array<keyof typeof AGENTS> => {
  return Object.keys(AGENTS) as Array<keyof typeof AGENTS>;
};
