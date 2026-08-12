"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, CircleCheck, Clock3, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useChat } from "@/app/chat-provider";
import { getListing } from "@/lib/listings";
import type { ChatActionCard, ChatContext, ChatMessage, ChatThread, RentalListing } from "@/lib/types";

const KUBO_AVATAR = "/images/kubo-mascot.png";

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

function recentLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return timeLabel(value);
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function ParticipantAvatar({ thread, size = 44 }: { thread: ChatThread; size?: number }) {
  return <span className={`chat-avatar ${thread.kind === "assistant" ? "chat-kubo-avatar" : ""}`} style={{ width: size, height: size }}><Image src={thread.participant.avatar} alt="" fill sizes={`${size}px`} unoptimized /></span>;
}

function suggestionsFor(thread: ChatThread, route: string) {
  if (thread.kind === "owner") return ["Is this still available?", "Can I schedule a viewing?", "Are utilities included?", "What are the lease terms?"];
  if (thread.context.listingId || /^\/properties\/[^/]+$/.test(route)) return ["Summarize this property", "Message the host", "Help me reserve"];
  if (route.startsWith("/wishlists") || route.startsWith("/compare")) return ["Compare my choices", "Find similar homes", "Help me decide"];
  if (route.startsWith("/trips") || route.startsWith("/reserve")) return ["Summarize my trip", "Message the host", "What should I prepare?"];
  if (route.startsWith("/properties")) return ["Find a condo under ₱25k", "Show furnished homes", "Compare my choices"];
  return ["Find a condo under ₱25k", "Show homes near BGC", "Help me compare"];
}

function ActionCard({ action, message, thread, onConfirm, onOpenOwner }: { action: ChatActionCard; message: ChatMessage; thread: ChatThread; onConfirm: () => void; onOpenOwner: (listing: RentalListing) => void }) {
  const listing = action.listingId ? getListing(action.listingId) : undefined;
  return <div className={`chat-action-card chat-action-${action.kind}`}>
    <strong>{action.title}</strong>
    <p>{action.body}</p>
    {action.kind === "search" && action.href && <a href={action.href} className="chat-action-button">{action.label}</a>}
    {action.kind === "reservation" && !action.confirmed && <button type="button" className="chat-action-button" onClick={onConfirm}>{action.label}</button>}
    {action.kind === "reservation" && action.confirmed && action.href && <Link href={action.href} className="chat-action-button">{action.label}</Link>}
    {action.kind === "owner-message" && !action.confirmed && <button type="button" className="chat-action-button" onClick={onConfirm}>{action.label}</button>}
    {action.kind === "owner-message" && action.confirmed && listing && <button type="button" className="chat-action-button" onClick={() => onOpenOwner(listing)}>{action.label}</button>}
    {action.confirmed && (action.kind === "reservation" || action.kind === "owner-message") && <span className="chat-action-confirmed"><Check size={14} />Ready to continue</span>}
    <span className="sr-only">Action in conversation with {thread.participant.name}, message {message.id}</span>
  </div>;
}

function Inbox({ threads, onOpenAssistant, onOpenThread }: { threads: ChatThread[]; onOpenAssistant: () => void; onOpenThread: (id: string) => void }) {
  const assistant = threads.find((thread) => thread.kind === "assistant");
  const owners = threads.filter((thread) => thread.kind === "owner");
  return <div className="chat-inbox">
    <button type="button" className="chat-inbox-row" onClick={() => assistant ? onOpenThread(assistant.id) : onOpenAssistant()}>
      {assistant ? <ParticipantAvatar thread={assistant} /> : <span className="chat-avatar chat-kubo-avatar"><Image src={KUBO_AVATAR} alt="" fill sizes="44px" unoptimized /></span>}
      <span className="chat-inbox-copy"><span><strong>Kubo assistant</strong><small>{assistant ? recentLabel(assistant.updatedAt) : ""}</small></span><span>{assistant?.messages.at(-1)?.body ?? "Search, compare, reserve, and plan your move."}</span></span>
      {!!assistant?.unreadCount && <span className="chat-unread" aria-label={`${assistant.unreadCount} unread message${assistant.unreadCount === 1 ? "" : "s"}`}>{assistant.unreadCount}</span>}
    </button>
    {owners.length ? <div className="chat-owner-threads" aria-label="Property host conversations">{owners.map((thread) => {
      const listing = thread.context.listingId ? getListing(thread.context.listingId) : undefined;
      return <button type="button" className="chat-inbox-row" onClick={() => onOpenThread(thread.id)} key={thread.id}>
        <ParticipantAvatar thread={thread} />
        <span className="chat-inbox-copy"><span><strong>{thread.participant.name}</strong><small>{recentLabel(thread.updatedAt)}</small></span><span>{thread.messages.at(-1)?.body ?? `Ask about ${listing?.title ?? "this property"}`}</span><small>{listing?.title}</small></span>
        {!!thread.unreadCount && <span className="chat-unread" aria-label={`${thread.unreadCount} unread message${thread.unreadCount === 1 ? "" : "s"}`}>{thread.unreadCount}</span>}
      </button>;
    })}</div> : <div className="chat-inbox-empty"><MessageCircle size={25} /><strong>No host conversations yet</strong><p>Open a property and choose Message host to start one.</p></div>}
  </div>;
}

function Conversation({ thread, route, onSend, onConfirm, onOpenOwner }: { thread: ChatThread; route: string; onSend: (text: string) => void; onConfirm: (messageId: string) => void; onOpenOwner: (listing: RentalListing) => void }) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const listing = thread.context.listingId ? getListing(thread.context.listingId) : undefined;
  const prompts = suggestionsFor(thread, route);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
    return () => window.cancelAnimationFrame(frame);
  }, [thread.messages.length]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const message = draft.trim();
    if (!message) return;
    onSend(message);
    setDraft("");
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return <>
    <div className="chat-thread-scroll" ref={scrollRef} aria-live="polite">
      {listing && <Link href={`/properties/${listing.slug}`} className="chat-property-context"><span className="chat-property-image"><Image src={listing.gallery[0]} alt="" fill sizes="64px" unoptimized /></span><span><small>{thread.kind === "owner" ? "Talking about" : "Current property"}</small><strong>{listing.title}</strong><span>{listing.neighborhood}, {listing.city}</span></span><span>View</span></Link>}
      {thread.kind === "owner" && <div className="chat-safety-note"><ShieldCheck size={17} /><span>Keep messages, reservations, and payments on Kubo.</span></div>}
      {!thread.messages.length && <div className="chat-welcome">
        {thread.kind === "assistant" ? <><span className="chat-welcome-avatar"><Image src={KUBO_AVATAR} alt="" fill sizes="72px" unoptimized /></span><h3>How can I help?</h3><p>I can find homes, compare options, explain a property, prepare a reservation, or help you contact a host.</p></> : <><ParticipantAvatar thread={thread} size={64} /><h3>Message {thread.participant.name}</h3><p>Ask about availability, viewing schedules, costs, or lease terms.</p></>}
      </div>}
      <div className="chat-message-list">
        {thread.messages.map((message) => <div className={`chat-message-row chat-message-${message.sender}`} key={message.id}>
          <div className="chat-message-bubble"><p>{message.body}</p><span>{timeLabel(message.createdAt)}{message.sender === "user" && message.status === "sending" ? "  Sending" : ""}</span></div>
          {message.action && <ActionCard action={message.action} message={message} thread={thread} onConfirm={() => onConfirm(message.id)} onOpenOwner={onOpenOwner} />}
        </div>)}
      </div>
      <div className="chat-prompt-row" aria-label="Suggested messages">{prompts.map((prompt) => <button type="button" onClick={() => onSend(prompt)} key={prompt}>{prompt}</button>)}</div>
    </div>
    <form className="chat-composer" onSubmit={submit}>
      <label className="sr-only" htmlFor={`chat-message-${thread.id}`}>Message {thread.participant.name}</label>
      <textarea id={`chat-message-${thread.id}`} rows={1} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder={thread.kind === "assistant" ? "Ask Kubo anything" : `Message ${thread.participant.name}`} />
      <button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={18} /></button>
    </form>
  </>;
}

export function ChatDock() {
  const pathname = usePathname();
  const { threads, activeThread, activeThreadId, panelOpen, view, totalUnread, openAssistant, openOwnerThread, openInbox, showThread, collapseChat, sendMessage, confirmAction } = useChat();
  const panelRef = useRef<HTMLElement>(null);
  const excluded = pathname.startsWith("/admin") || pathname.startsWith("/demo/admin") || pathname.startsWith("/seller") || pathname.startsWith("/sell") || /^\/properties\/[^/]+\/photos$/.test(pathname);
  const currentContext = useMemo<ChatContext>(() => {
    const match = pathname.match(/^\/properties\/([^/]+)$/);
    const listing = match ? getListing(match[1]) : undefined;
    return { route: pathname, search: typeof window === "undefined" ? "" : window.location.search, listingId: listing?.id };
  }, [pathname]);

  useEffect(() => {
    if (!panelOpen) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") collapseChat();
    };
    document.addEventListener("keydown", onKeyDown);
    const frame = window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("button, textarea")?.focus());
    return () => { document.removeEventListener("keydown", onKeyDown); window.cancelAnimationFrame(frame); };
  }, [panelOpen, collapseChat]);

  if (excluded) return null;
  const title = view === "inbox" || !activeThread ? "Messages" : activeThread.participant.name;

  return <div className={`chat-dock-root ${panelOpen ? "chat-dock-open" : ""}`}>
    <button type="button" className="kubo-chat-launcher" aria-label="Ask Kubo" onClick={() => openAssistant(currentContext)}>
      <Image src={KUBO_AVATAR} alt="" fill sizes="60px" unoptimized />
      <span className="kubo-launcher-label">Ask Kubo</span>
      {!!totalUnread && <span className="kubo-launcher-unread" aria-label={`${totalUnread} unread message${totalUnread === 1 ? "" : "s"}`}>{Math.min(totalUnread, 9)}</span>}
    </button>
    <aside ref={panelRef} className="chat-dock-panel" role="dialog" aria-modal="false" aria-label={title} aria-hidden={!panelOpen}>
      <header className="chat-dock-header">
        {view === "thread" && activeThread ? <button type="button" className="chat-header-button" onClick={openInbox} aria-label="Back to messages"><ArrowLeft size={20} /></button> : <span className="chat-header-spacer" />}
        <div className="chat-header-identity">
          {view === "thread" && activeThread ? <><ParticipantAvatar thread={activeThread} size={40} /><span><strong>{activeThread.participant.name}{activeThread.participant.verified && <CircleCheck size={15} aria-label="Verified host" />}</strong><small>{activeThread.kind === "assistant" ? "AI assistant" : <><Clock3 size={12} />{activeThread.participant.subtitle}</>}</small></span></> : <><span><strong>Messages</strong><small>Kubo and property hosts</small></span></>}
        </div>
        <button type="button" className="chat-header-button" onClick={collapseChat} aria-label="Collapse chat"><ChevronDown size={21} /></button>
      </header>
      <div className="chat-dock-body">
        {view === "inbox" || !activeThread ? <Inbox threads={threads} onOpenAssistant={() => openAssistant(currentContext)} onOpenThread={showThread} /> : <Conversation thread={activeThread} route={pathname} onSend={(text) => sendMessage(activeThread.id, text)} onConfirm={(messageId) => confirmAction(activeThread.id, messageId)} onOpenOwner={openOwnerThread} />}
      </div>
      <span className="sr-only" aria-live="polite">{activeThreadId ? `Conversation open with ${activeThread?.participant.name ?? ""}` : ""}</span>
    </aside>
  </div>;
}
