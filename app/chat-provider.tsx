"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { peso } from "@/lib/finance";
import { CHAT_STORAGE_KEY, DEFAULT_CHAT_STATE, parseChatState, type ChatState } from "@/lib/chat-state";
import { getListing } from "@/lib/listings";
import type { ChatActionCard, ChatContext, ChatMessage, ChatThread, RentalListing } from "@/lib/types";

type ChatView = "inbox" | "thread";

type ChatContextValue = {
  threads: ChatThread[];
  activeThread: ChatThread | null;
  activeThreadId: string | null;
  panelOpen: boolean;
  view: ChatView;
  totalUnread: number;
  openAssistant: (context?: ChatContext) => void;
  openOwnerThread: (listing: RentalListing) => void;
  openInbox: () => void;
  showThread: (threadId: string) => void;
  collapseChat: () => void;
  sendMessage: (threadId: string, text: string) => void;
  confirmAction: (threadId: string, messageId: string) => void;
  markThreadRead: (threadId: string) => void;
};

const ChatContextState = createContext<ChatContextValue | null>(null);
const KUBO_THREAD_ID = "assistant-kubo";
const KUBO_AVATAR = "/images/kubo-mascot.png";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function assistantThread(context: ChatContext = {}): ChatThread {
  const now = new Date().toISOString();
  return {
    id: KUBO_THREAD_ID,
    kind: "assistant",
    participant: { id: "kubo", name: "Kubo assistant", avatar: KUBO_AVATAR, kind: "assistant", subtitle: "AI assistant" },
    context,
    messages: [],
    updatedAt: now,
    unreadCount: 0,
  };
}

function ownerThread(listing: RentalListing): ChatThread {
  const now = new Date().toISOString();
  return {
    id: `owner-${listing.host.id}-${listing.id}`,
    kind: "owner",
    participant: {
      id: listing.host.id,
      name: listing.host.name,
      avatar: listing.host.avatar,
      kind: "owner",
      verified: listing.host.verified,
      subtitle: listing.host.responseTime,
    },
    context: { route: `/properties/${listing.slug}`, listingId: listing.id },
    messages: [],
    updatedAt: now,
    unreadCount: 0,
  };
}

function ownerReply(listing: RentalListing | undefined, text: string) {
  const normalized = text.toLowerCase();
  if (normalized.includes("available")) return `Hi! Yes, ${listing ? listing.title : "the home"} is still available for the listed move-in date. I can also share the next viewing schedule.`;
  if (normalized.includes("view") || normalized.includes("visit")) return "I can arrange a viewing. Weekday afternoons and Saturday mornings usually work best. What day suits you?";
  if (normalized.includes("utilit")) return "Utilities are billed separately based on usage. The listing estimate is a helpful monthly guide.";
  if (normalized.includes("lease")) return `The minimum lease is ${listing?.minimumLeaseMonths ?? 12} months. Let me know your target move-in date and I can confirm the terms.`;
  return "Thanks for your message. I’ll check the details and get back to you shortly.";
}

function searchAction(text: string): ChatActionCard {
  const normalized = text.toLowerCase();
  const where = normalized.includes("makati") ? "Makati" : normalized.includes("bgc") || normalized.includes("taguig") ? "Taguig" : "Metro Manila";
  const type = normalized.includes("dorm") ? "dorm" : normalized.includes("condo") ? "condo" : "home";
  const priceMatch = normalized.match(/(?:under|below)\s*(?:₱|php)?\s*(\d+)\s*k?/i);
  const rawPrice = priceMatch ? Number(priceMatch[1]) : 25000;
  const maxPrice = rawPrice < 1000 ? rawPrice * 1000 : rawPrice;
  const params = new URLSearchParams({ where, lease: "12", adults: "1", type, maxPrice: String(maxPrice) });
  return {
    id: uid("action"),
    kind: "search",
    title: `${type === "dorm" ? "Dorms" : type === "condo" ? "Condos" : "Homes"} in ${where}`,
    body: `Up to ${peso(maxPrice)} per month with a 12-month lease.`,
    label: "View homes",
    href: `/properties?${params.toString()}`,
  };
}

function assistantReply(thread: ChatThread, text: string): ChatMessage {
  const listing = thread.context.listingId ? getListing(thread.context.listingId) : undefined;
  const normalized = text.toLowerCase();
  let body = "I found a useful next step for you.";
  let action: ChatActionCard | undefined;

  if (normalized.includes("summar") && listing) {
    body = `Here’s the clearest summary of ${listing.title}.`;
    action = {
      id: uid("action"),
      kind: "summary",
      title: `${peso(listing.monthlyRent)} per month`,
      body: `${listing.bedrooms || "Studio"} bedroom${listing.bedrooms === 1 ? "" : "s"}, ${listing.bathrooms} bath\nAvailable ${new Date(listing.availableFrom).toLocaleDateString("en-PH", { month: "long", day: "numeric" })}\n${listing.minimumLeaseMonths}-month minimum lease\n${listing.amenities.slice(0, 3).join(", ")}`,
      listingId: listing.id,
    };
  } else if ((normalized.includes("reserve") || normalized.includes("reservation")) && listing) {
    body = "I prepared the reservation details. Review them before continuing.";
    const params = new URLSearchParams({ moveIn: listing.availableFrom, lease: String(Math.max(12, listing.minimumLeaseMonths)), adults: "1", children: "0", pets: "0" });
    action = {
      id: uid("action"),
      kind: "reservation",
      title: `Reserve ${listing.title}`,
      body: `${peso(listing.monthlyRent)} per month, available ${new Date(listing.availableFrom).toLocaleDateString("en-PH", { month: "long", day: "numeric" })}.`,
      label: "Review reservation",
      href: `/reserve/${listing.slug}?${params.toString()}`,
      listingId: listing.id,
      confirmed: false,
    };
  } else if ((normalized.includes("message") || normalized.includes("host") || normalized.includes("owner")) && listing) {
    const draft = `Hi ${listing.host.name}, is ${listing.title} still available for the listed move-in date?`;
    body = "I drafted a message for the host. Review it before opening the conversation.";
    action = {
      id: uid("action"),
      kind: "owner-message",
      title: `Message ${listing.host.name}`,
      body: draft,
      label: "Review message",
      listingId: listing.id,
      messageDraft: draft,
      confirmed: false,
    };
  } else if (normalized.includes("compare")) {
    body = "Open the properties you are considering and I can organize the rent, location, amenities, and lease terms for you.";
  } else {
    body = "I found homes that match the request. You can review the results before changing your search.";
    action = searchAction(text);
  }

  return { id: uid("message"), sender: "assistant", body, createdAt: new Date().toISOString(), status: "sent", action };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>(DEFAULT_CHAT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState<ChatView>("inbox");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const activeTimers = timers.current;
    queueMicrotask(() => {
      setState(parseChatState(window.localStorage.getItem(CHAT_STORAGE_KEY)));
      setHydrated(true);
    });
    return () => activeTimers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const rememberFocus = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setState((current) => ({ ...current, threads: current.threads.map((thread) => thread.id === threadId ? { ...thread, unreadCount: 0 } : thread) }));
  }, []);

  const openAssistant = useCallback((context: ChatContext = {}) => {
    rememberFocus();
    setState((current) => {
      const existing = current.threads.find((thread) => thread.id === KUBO_THREAD_ID);
      if (!existing) return { ...current, threads: [assistantThread(context), ...current.threads] };
      return { ...current, threads: current.threads.map((thread) => thread.id === KUBO_THREAD_ID ? { ...thread, context: { ...thread.context, ...context }, unreadCount: 0 } : thread) };
    });
    setActiveThreadId(KUBO_THREAD_ID);
    setView("thread");
    setPanelOpen(true);
  }, [rememberFocus]);

  const openOwnerThread = useCallback((listing: RentalListing) => {
    rememberFocus();
    const threadId = `owner-${listing.host.id}-${listing.id}`;
    setState((current) => {
      const existing = current.threads.some((thread) => thread.id === threadId);
      return existing
        ? { ...current, threads: current.threads.map((thread) => thread.id === threadId ? { ...thread, unreadCount: 0 } : thread) }
        : { ...current, threads: [...current.threads, ownerThread(listing)] };
    });
    setActiveThreadId(threadId);
    setView("thread");
    setPanelOpen(true);
  }, [rememberFocus]);

  const openInbox = useCallback(() => {
    rememberFocus();
    setView("inbox");
    setPanelOpen(true);
  }, [rememberFocus]);

  const showThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
    setView("thread");
    markThreadRead(threadId);
  }, [markThreadRead]);

  const collapseChat = useCallback(() => {
    setPanelOpen(false);
    window.setTimeout(() => returnFocus.current?.focus(), 0);
  }, []);

  const sendMessage = useCallback((threadId: string, rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    const sentAt = new Date().toISOString();
    const messageId = uid("message");
    const userMessage: ChatMessage = { id: messageId, sender: "user", body: text, createdAt: sentAt, status: "sending" };
    setState((current) => ({ ...current, threads: current.threads.map((thread) => thread.id === threadId ? { ...thread, messages: [...thread.messages, userMessage], updatedAt: sentAt, unreadCount: 0 } : thread) }));

    timers.current.push(window.setTimeout(() => {
      setState((current) => ({ ...current, threads: current.threads.map((thread) => thread.id === threadId ? { ...thread, messages: thread.messages.map((message) => message.id === messageId ? { ...message, status: "sent" } : message) } : thread) }));
    }, 260));

    timers.current.push(window.setTimeout(() => {
      setState((current) => {
        const target = current.threads.find((thread) => thread.id === threadId);
        if (!target) return current;
        const listing = target.context.listingId ? getListing(target.context.listingId) : undefined;
        const reply = target.kind === "assistant"
          ? assistantReply(target, text)
          : { id: uid("message"), sender: "owner" as const, body: ownerReply(listing, text), createdAt: new Date().toISOString(), status: "sent" as const };
        const isVisible = panelOpen && activeThreadId === threadId && view === "thread";
        return {
          ...current,
          threads: current.threads.map((thread) => thread.id === threadId ? { ...thread, messages: [...thread.messages, reply], updatedAt: reply.createdAt, unreadCount: isVisible ? 0 : thread.unreadCount + 1 } : thread),
        };
      });
    }, 860));
  }, [activeThreadId, panelOpen, view]);

  const confirmAction = useCallback((threadId: string, messageId: string) => {
    setState((current) => ({
      ...current,
      threads: current.threads.map((thread) => thread.id === threadId ? {
        ...thread,
        messages: thread.messages.map((message) => message.id === messageId && message.action ? { ...message, action: { ...message.action, confirmed: true, label: message.action.kind === "reservation" ? "Continue to checkout" : "Open host chat" } } : message),
      } : thread),
    }));
  }, []);

  const threads = useMemo(() => [...state.threads].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "assistant" ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }), [state.threads]);
  const activeThread = state.threads.find((thread) => thread.id === activeThreadId) ?? null;
  const totalUnread = state.threads.reduce((total, thread) => total + thread.unreadCount, 0);
  const value = useMemo(() => ({ threads, activeThread, activeThreadId, panelOpen, view, totalUnread, openAssistant, openOwnerThread, openInbox, showThread, collapseChat, sendMessage, confirmAction, markThreadRead }), [threads, activeThread, activeThreadId, panelOpen, view, totalUnread, openAssistant, openOwnerThread, openInbox, showThread, collapseChat, sendMessage, confirmAction, markThreadRead]);

  return <ChatContextState.Provider value={value}>{children}</ChatContextState.Provider>;
}

export function useChat() {
  const context = useContext(ChatContextState);
  if (!context) throw new Error("useChat must be used inside ChatProvider");
  return context;
}
