// src/app/[locale]/utils/languageConfig.ts 
import { FunctionDeclaration } from '@google/generative-ai';
import { Language } from './regular-chat.types';


import {
   
    EN_conferenceAgentSystemInstructions,
    EN_adminContactAgentSystemInstructions, 
    EN_navigationAgentSystemInstructions, 
    EN_websiteInfoAgentSystemInstructions,

    EN_routeToAgentDeclaration,
    // vietnam_routeToAgentDeclaration,
    // china_routeToAgentDeclaration,  
    
    EN_hostAgentSystemInstructions,
    // vietnameseHostAgentSystemInstructions,
    // chineseHostAgentSystemInstructions,  

    EN_getConferencesDeclaration, EN_getJournalsDeclaration, EN_getWebsiteInfoDeclaration, EN_navigationDeclaration, EN_openGoogleMapDeclaration, EN_followUnfollowItemDeclaration, EN_journalAgentSystemInstructions, EN_sendEmailToAdminDeclaration, 

    // vietnameseSystemInstructions, vietnam_getConferencesDeclaration, vietnam_getJournalsDeclaration, vietnam_getWebsiteInfoDeclaration,
    // chineseSystemInstructions, china_getConferencesDeclaration, china_getJournalsDeclaration, china_getWebsiteInfoDeclaration, china_drawChartDeclaration,

} from "./functions";

// --- Define Agent IDs ---
export type AgentId = 'HostAgent' | 'ConferenceAgent' | 'JournalAgent' | 'AdminContactAgent' | 'NavigationAgent' | 'WebsiteInfoAgent'; // <-- Add

// --- Define the structure for language-specific configuration per agent ---
interface LanguageAgentConfig {
    systemInstructions: string;
    functionDeclarations: FunctionDeclaration[];
}


// --- Map configurations ---
const agentLanguageConfigurations: Record<AgentId, Partial<Record<Language, LanguageAgentConfig>>> = {
    'HostAgent': {
        'en': {
            systemInstructions: EN_hostAgentSystemInstructions,
            functionDeclarations: [EN_routeToAgentDeclaration], // Assuming this is the EN one
        },
        // 'vi': {
        //     systemInstructions: vietnameseHostAgentSystemInstructions, // Add appropriate instructions
        //     functionDeclarations: [vietnam_routeToAgentDeclaration], // Add the VI declaration
        // },
        // 'zh': {
        //     systemInstructions: chineseHostAgentSystemInstructions, // Add appropriate instructions
        //     functionDeclarations: [china_routeToAgentDeclaration], // Add the ZH declaration
        // },
    },
    'ConferenceAgent': {
        'en': {
            systemInstructions: EN_conferenceAgentSystemInstructions, 
            functionDeclarations: [
                EN_getConferencesDeclaration,
                EN_followUnfollowItemDeclaration, 
            ],
        },
        // ... other languages for ConferenceAgent ...
    },
    // --- Add JournalAgent Config ---
    'JournalAgent': {
        'en': {
            systemInstructions: EN_journalAgentSystemInstructions,
            functionDeclarations: [
                EN_getJournalsDeclaration,
                EN_followUnfollowItemDeclaration,
            ],
        },
        // Add 'vi', 'zh' configs for JournalAgent if needed
    },
    'AdminContactAgent': {
        'en': {
            systemInstructions: EN_adminContactAgentSystemInstructions,
            functionDeclarations: [
                EN_sendEmailToAdminDeclaration,
            ],
        },
        // Add 'vi', 'zh' configs if needed
    },

    'NavigationAgent': {
        'en': {
            systemInstructions: EN_navigationAgentSystemInstructions,
            functionDeclarations: [
                EN_navigationDeclaration,
                EN_openGoogleMapDeclaration,
            ],
        },
        // Add 'vi', 'zh' configs if needed
    },
    'WebsiteInfoAgent': {
        'en': {
            systemInstructions: EN_websiteInfoAgentSystemInstructions,
            functionDeclarations: [
                EN_getWebsiteInfoDeclaration,
            ],
        },
        // Add 'vi', 'zh' configs if needed
    }
    // ------------------------------
};

// --- Default language and agent ID for fallback ---
const DEFAULT_LANGUAGE: Language = 'en'; // Or 'vi' based on your preference
const DEFAULT_AGENT_ID: AgentId = 'HostAgent';

// --- Helper function to get the configuration ---
export function getAgentLanguageConfig(
    lang: Language | undefined,
    agentId: AgentId = DEFAULT_AGENT_ID // Default to HostAgent
): LanguageAgentConfig {
    const targetLang = lang || DEFAULT_LANGUAGE;
    const agentConfig = agentLanguageConfigurations[agentId];

    if (!agentConfig) {
        console.log(`[Language Config] WARN: Config not found for agent "${agentId}". Falling back to agent "${DEFAULT_AGENT_ID}".`);
        return getAgentLanguageConfig(targetLang, DEFAULT_AGENT_ID); // Recursive call for default agent
    }

    const langConfig = agentConfig[targetLang];

    if (!langConfig) {
        console.log(`[Language Config] WARN: Config not found for language "${targetLang}" in agent "${agentId}". Falling back to default language "${DEFAULT_LANGUAGE}" for this agent.`);
        // Fallback to default language within the same agent if possible
        const fallbackLangConfig = agentConfig[DEFAULT_LANGUAGE];
        if (fallbackLangConfig) {
            return fallbackLangConfig;
        } else {
            // Critical fallback if even default language is missing for the agent
            console.log(`[Language Config] CRITICAL: Default language config missing for agent "${agentId}". Returning empty config.`);
            return { systemInstructions: "Error: Config missing.", functionDeclarations: [] };
        }
    }

    console.log(`[Language Config] Using configuration for Agent: ${agentId}, Language: ${targetLang}`);
    return langConfig;
}