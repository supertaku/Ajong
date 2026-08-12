import type { ChatThread } from "./types";

export const CHAT_STORAGE_KEY = "kubo-messages-v1";

export interface ChatState {
  version: 1;
  threads: ChatThread[];
}

export const DEFAULT_CHAT_STATE: ChatState = { version: 1, threads: [] };

function isThread(value: unknown): value is ChatThread {
  if (!value || typeof value !== "object") return false;
  const thread = value as Partial<ChatThread>;
  return typeof thread.id === "string"
    && (thread.kind === "assistant" || thread.kind === "owner")
    && Boolean(thread.participant)
    && Array.isArray(thread.messages)
    && typeof thread.updatedAt === "string";
}

export function parseChatState(serialized: string | null): ChatState {
  if (!serialized) return DEFAULT_CHAT_STATE;
  try {
    const value = JSON.parse(serialized) as Partial<ChatState>;
    if (value.version !== 1 || !Array.isArray(value.threads)) return DEFAULT_CHAT_STATE;
    return { version: 1, threads: value.threads.filter(isThread) };
  } catch {
    return DEFAULT_CHAT_STATE;
  }
}
