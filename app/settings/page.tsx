"use client";

import { useState } from "react";
import { User, Bell, Shield, Palette, Key, Save, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "api", label: "API Keys", icon: Key },
];

function ProfileSettings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white mb-4">Profile information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-5 p-5 rounded-xl bg-white/[0.03] border border-white/8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
              N
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Profile photo</p>
              <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Upload new photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Full name</label>
              <input
                defaultValue="nikhil"
                className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input
                defaultValue="nikhil@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Workspace name</label>
            <input
              defaultValue="Design team"
              className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
          saved
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25"
        )}
      >
        {saved ? <CheckCircle size={14} /> : <Save size={14} />}
        {saved ? "Saved!" : "Save changes"}
      </button>
    </div>
  );
}

function NotificationsSettings() {
  const [prefs, setPrefs] = useState({
    upload: true,
    chat: true,
    weekly: false,
    tips: true,
  });

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const items = [
    { key: "upload" as const, label: "Document processing", desc: "Notify when a document finishes processing" },
    { key: "chat" as const, label: "New chat replies", desc: "Notifications for AI responses" },
    { key: "weekly" as const, label: "Weekly digest", desc: "Summary of your activity every Monday" },
    { key: "tips" as const, label: "Product tips", desc: "Helpful tips to get more out of DocuMind" },
  ];

  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-4">Notification preferences</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/8"
          >
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={() => togglePref(item.key)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200",
                prefs[item.key] ? "bg-purple-600" : "bg-white/10"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                  prefs[item.key] && "translate-x-5"
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-4">Security</h3>
      <div className="space-y-4">
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
          <p className="text-sm font-semibold text-white mb-1">Change password</p>
          <p className="text-xs text-gray-500 mb-4">Last changed 30 days ago</p>
          <div className="space-y-3 max-w-sm">
            <input
              type="password"
              placeholder="Current password"
              className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
              Update password
            </button>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/15">
          <p className="text-sm font-semibold text-red-400 mb-1">Danger zone</p>
          <p className="text-xs text-gray-500 mb-3">
            Deleting your account is permanent. All your documents and chats will be removed.
          </p>
          <button className="text-sm text-red-400 hover:text-red-300 font-medium border border-red-500/20 hover:border-red-500/40 px-4 py-2 rounded-lg transition-colors">
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState("dark");

  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-4">Appearance</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-300 mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-3 max-w-sm">
            {["dark", "darker", "system"].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all",
                  theme === t
                    ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                    : "border-white/8 bg-white/[0.02] text-gray-400 hover:border-white/15"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg mx-auto mb-2",
                    t === "dark" ? "bg-[#1a1b2e]" : t === "darker" ? "bg-[#0a0c16]" : "bg-gradient-to-br from-gray-700 to-gray-900"
                  )}
                />
                <span className="text-xs font-medium capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiSettings() {
  const [keyVisible, setKeyVisible] = useState(false);

  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-4">API Keys</h3>
      <div className="space-y-4">
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">OpenAI API Key</p>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type={keyVisible ? "text" : "password"}
              defaultValue="sk-proj-xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm font-mono focus:outline-none"
              readOnly
            />
            <button
              onClick={() => setKeyVisible(!keyVisible)}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              {keyVisible ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Used for document analysis and chat responses.</p>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">Supabase Project</p>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Configure</span>
          </div>
          <div className="space-y-2">
            <input
              placeholder="Project URL"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
            <input
              placeholder="Anon key"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const PANELS: Record<string, React.ReactNode> = {
  profile: <ProfileSettings />,
  notifications: <NotificationsSettings />,
  security: <SecuritySettings />,
  appearance: <AppearanceSettings />,
  api: <ApiSettings />,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 uppercase tracking-widest font-medium">
          <span className="text-purple-400">WORKSPACE</span>
          <span>/</span>
          <span>SETTINGS</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-1">Settings</h1>
        <p className="text-gray-400">Manage your account and workspace preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Tabs sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {settingsTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                  activeTab === id
                    ? "bg-white/8 text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Panel */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-[#111320] border border-white/8 rounded-2xl p-6"
        >
          {PANELS[activeTab]}
        </motion.div>
      </div>
    </div>
  );
}
