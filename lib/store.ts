import { create } from "zustand";

export interface Document {
  id: string;
  name: string;
  file_type: "pdf" | "docx" | "txt" | "file";
  size: number;
  pages?: number;
  status: "processing" | "ready" | "error";
  created_at: string;
  user_id: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  created_at: string;
}

export interface Source {
  document_name: string;
  page: number;
  snippet: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  document_id?: string;
}

interface AppState {
  // Documents
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;

  // Chats
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;

  // Messages
  messages: Record<string, Message[]>;
  setMessages: (chatId: string, msgs: Message[]) => void;
  addMessage: (chatId: string, msg: Message) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedDocumentFilter: string;
  setSelectedDocumentFilter: (id: string) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  documents: [],
  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  removeDocument: (id) =>
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),

  chats: [],
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
  activeChat: null,
  setActiveChat: (chat) => set({ activeChat: chat }),

  messages: {},
  setMessages: (chatId, msgs) =>
    set((state) => ({ messages: { ...state.messages, [chatId]: msgs } })),
  addMessage: (chatId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] ?? []), msg],
      },
    })),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  selectedDocumentFilter: "all",
  setSelectedDocumentFilter: (id) => set({ selectedDocumentFilter: id }),
  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
}));
