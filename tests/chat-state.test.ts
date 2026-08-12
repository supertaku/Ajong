import { describe, expect, it } from "vitest";
import { DEFAULT_CHAT_STATE, parseChatState } from "@/lib/chat-state";

describe("chat state", () => {
  it("loads valid owner and assistant threads", () => {
    const state = parseChatState(JSON.stringify({
      version: 1,
      threads: [
        { id: "assistant-kubo", kind: "assistant", participant: { id: "kubo" }, messages: [], updatedAt: "2026-08-12T00:00:00.000Z" },
        { id: "owner-1", kind: "owner", participant: { id: "host-1" }, messages: [], updatedAt: "2026-08-12T00:00:00.000Z" },
      ],
    }));
    expect(state.threads.map((thread) => thread.kind)).toEqual(["assistant", "owner"]);
  });

  it("recovers from corrupt, future, and malformed state", () => {
    expect(parseChatState("broken")).toEqual(DEFAULT_CHAT_STATE);
    expect(parseChatState(JSON.stringify({ version: 2, threads: [] }))).toEqual(DEFAULT_CHAT_STATE);
    expect(parseChatState(JSON.stringify({ version: 1, threads: [{ id: 2 }] }))).toEqual(DEFAULT_CHAT_STATE);
  });
});
