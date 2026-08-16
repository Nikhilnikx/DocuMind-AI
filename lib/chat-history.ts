// Chat history stored entirely in localStorage — no backend needed

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { doc: string; page: number; snippet: string }[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  documentName?: string;
  documentText?: string; // stored to allow re-asking
  model: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const KEY = "documind_chats";

function load(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  // Keep max 50 sessions, trim document text to 30k to stay within localStorage limits
  const trimmed = sessions.slice(0, 50).map((s) => ({
    ...s,
    documentText: s.documentText?.slice(0, 30000),
  }));
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full — remove oldest half and retry
    const half = trimmed.slice(0, Math.floor(trimmed.length / 2));
    localStorage.setItem(KEY, JSON.stringify(half));
  }
}

export const chatHistory = {
  getAll(): ChatSession[] {
    return load().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  get(id: string): ChatSession | undefined {
    return load().find((s) => s.id === id);
  },

  create(opts: {
    title?: string;
    documentName?: string;
    documentText?: string;
    model?: string;
  }): ChatSession {
    const sessions = load();
    const session: ChatSession = {
      id: `chat_${Date.now()}`,
      title: opts.title ?? "New chat",
      documentName: opts.documentName,
      documentText: opts.documentText,
      model: opts.model ?? "gpt-4o-mini",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessions.unshift(session);
    save(sessions);
    return session;
  },

  addMessage(sessionId: string, message: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
    const sessions = load();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) throw new Error("Session not found");

    const msg: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    sessions[idx].messages.push(msg);
    sessions[idx].updatedAt = new Date().toISOString();

    // Auto-title from first user message
    if (message.role === "user" && sessions[idx].messages.filter((m) => m.role === "user").length === 1) {
      sessions[idx].title = message.content.slice(0, 50).trim();
    }

    save(sessions);
    return msg;
  },

  updateDocument(sessionId: string, documentName: string, documentText: string) {
    const sessions = load();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) return;
    sessions[idx].documentName = documentName;
    sessions[idx].documentText = documentText;
    sessions[idx].updatedAt = new Date().toISOString();
    save(sessions);
  },

  rename(sessionId: string, title: string) {
    const sessions = load();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) return;
    sessions[idx].title = title;
    save(sessions);
  },

  delete(sessionId: string) {
    save(load().filter((s) => s.id !== sessionId));
  },

  clear() {
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
  },
};
