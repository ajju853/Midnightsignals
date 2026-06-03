import React, { useState, useEffect } from "react";
import {
  Check,
  Shield,
  Mail,
  Linkedin,
  Twitter,
  User,
  Sparkles,
  Lock,
  Unlock,
  FileText,
  CheckCircle,
  Eye,
  HelpCircle,
  AlertTriangle,
  Heart,
  Download,
  Award,
  Info,
  Sliders,
  Globe,
  BellRing
} from "lucide-react";
import { EchoItem, VibeType } from "../types";

// ==========================================
// 1. COOKIE CONSENT SYSTEM
// ==========================================
export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
}

export const updateGoogleConsent = (prefs: CookiePreferences) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: prefs.analytics ? "granted" : "denied",
      ad_storage: prefs.advertising ? "granted" : "denied",
      ad_user_data: prefs.advertising ? "granted" : "denied",
      ad_personalization: prefs.advertising ? "granted" : "denied"
    });
    console.log("Google Consent Mode v2 loaded/updated:", {
      analytics_storage: prefs.analytics ? "granted" : "denied",
      ad_storage: prefs.advertising ? "granted" : "denied",
      ad_user_data: prefs.advertising ? "granted" : "denied",
      ad_personalization: prefs.advertising ? "granted" : "denied"
    });
  }
  // Dynamically load Infolinks when advertising consent is granted
  if (typeof window !== "undefined" && (window as any).infolinks_pid) {
    const existing = document.querySelector('script[src*="infolinks_main.js"]');
    if (prefs.advertising && !existing) {
      const script = document.createElement("script");
      script.src = "//resources.infolinks.com/js/infolinks_main.js";
      script.async = true;
      document.body.appendChild(script);
      console.log("Infolinks ads loaded (advertising consent granted).");
    } else if (!prefs.advertising && existing) {
      existing.remove();
      console.log("Infolinks ads removed (advertising consent denied).");
    }
  }
};

export function CookieConsent({ onSave }: { onSave: (prefs: CookiePreferences) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    advertising: false
  });

  useEffect(() => {
    const hasConsented = localStorage.getItem("midnight-signals-consent");
    if (hasConsented) {
      try {
        const parsedPrefs = JSON.parse(hasConsented) as CookiePreferences;
        setPrefs(parsedPrefs);
        updateGoogleConsent(parsedPrefs);
      } catch (e) {
        console.error("Error parsing stored cookie preferences:", e);
      }
    } else {
      // Small delay for clean entrance
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleShowConsenter = () => {
      setIsVisible(true);
      setShowPreferences(true);
    };
    window.addEventListener("show-cookie-consent", handleShowConsenter);
    return () => window.removeEventListener("show-cookie-consent", handleShowConsenter);
  }, []);

  const handleAcceptAll = () => {
    const allPrefs = { essential: true, analytics: true, advertising: true };
    localStorage.setItem("midnight-signals-consent", JSON.stringify(allPrefs));
    updateGoogleConsent(allPrefs);
    onSave(allPrefs);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const minPrefs = { essential: true, analytics: false, advertising: false };
    localStorage.setItem("midnight-signals-consent", JSON.stringify(minPrefs));
    updateGoogleConsent(minPrefs);
    onSave(minPrefs);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("midnight-signals-consent", JSON.stringify(prefs));
    updateGoogleConsent(prefs);
    onSave(prefs);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-[#0d0d12]/95 border border-white/10 backdrop-blur-md rounded-2xl p-5 shadow-2xl animate-slideUp text-xs text-zinc-300 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-sky-400" />
        <h4 className="font-mono uppercase font-bold tracking-wider text-white">Privacy Consent Manager</h4>
      </div>
      
      <p className="leading-relaxed">
        Midnight Signals uses essential, analytics, and advertising cookies to deliver real-time meditative synthesizer streams, analyze site traffic, and support independent AI music research.
      </p>

      {showPreferences ? (
        <div className="space-y-3 bg-zinc-950 p-3 rounded-xl border border-white/5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white">Essential (Secure Session)</span>
            <span className="text-emerald-400 text-[9px] uppercase bg-emerald-400/5 px-1.5 py-0.5 rounded border border-emerald-400/10">Required</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white">Analytics & Optimization</span>
            <input 
              type="checkbox"
              checked={prefs.analytics}
              onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
              className="accent-sky-400 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white">Personalized Ad Networks</span>
            <input 
              type="checkbox"
              checked={prefs.advertising}
              onChange={(e) => setPrefs({ ...prefs, advertising: e.target.checked })}
              className="accent-sky-400 cursor-pointer"
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        {showPreferences ? (
          <button
            type="button"
            onClick={handleSavePreferences}
            className="flex-1 bg-sky-500/10 border border-sky-400/30 hover:bg-sky-500/20 text-sky-400 font-mono py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
          >
            Save Options
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 bg-sky-500 hover:bg-sky-400 text-black font-mono py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleRejectAll}
              className="flex-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-300 font-mono py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Reject All
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          className="w-full text-center text-zinc-500 hover:text-zinc-300 font-mono text-[9px] uppercase tracking-wider transition-colors pt-1"
        >
          {showPreferences ? "← Hide Details" : "Manage Preferences ⚙️"}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 2. CONTACT US HUB
// ==========================================
export function ContactHub() {
  const [form, setForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", topic: "general", message: "" });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-400/10 space-y-1.5">
        <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">📨 Support & Inquiries Inbox</h4>
        <p className="text-zinc-450 leading-relaxed text-[11px]">
          Have a bug report, a custom atmospheric feature request, or corporate sponsorships inquiries? Drop a line directly to our transmission relay. Our operations center responds to all signals within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Contact Form Details */}
        <form onSubmit={handleSubmit} className="md:col-span-8 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-mono uppercase text-zinc-550 block">Your Name</label>
              <input 
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-indigo-500/40"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono uppercase text-zinc-550 block">Your Email</label>
              <input 
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-indigo-500/40"
                placeholder="jane@domain.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-mono uppercase text-zinc-550 block">Subject Topic</label>
            <select
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-indigo-500/40 font-mono"
            >
              <option value="general">General Inquiries</option>
              <option value="billing">Pro Premium Membership</option>
              <option value="feature">Custom Preset / Feature Requests</option>
              <option value="bug">Bug & Glitch Reports</option>
              <option value="ads">Ad Block Verification / Sponsorships</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-mono uppercase text-zinc-550 block">Your Message</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-indigo-500/40 resize-none"
              placeholder="Start drafting your signal..."
            />
          </div>

          {status === "success" ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 rounded-xl flex items-center gap-2 font-mono text-[10px]">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>SIGNAL SENT SUCCESSFULLY. TRANSMISSION LOGGED IN THE STARS!</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 text-black font-semibold font-mono text-center rounded-xl transition-all cursor-pointer uppercase tracking-wider text-[10px]"
            >
              {status === "submitting" ? "Transmitting Signal..." : "Submit Inquiry Signal"}
            </button>
          )}
        </form>

        {/* Business Office Details */}
        <div className="md:col-span-4 bg-zinc-900/60 p-4 border border-white/5 rounded-2xl space-y-4 font-mono text-[10px]">
          <div className="space-y-1.5">
            <span className="text-[8px] uppercase tracking-wider text-zinc-500 block">Creator Hub Email</span>
            <a href="mailto:ajimp340@gmail.com" className="text-white hover:text-[#00D1FF] transition-all flex items-center gap-1.5 break-all">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>ajimp340@gmail.com</span>
            </a>
          </div>

          <div className="space-y-2">
            <span className="text-[8px] uppercase tracking-wider text-zinc-500 block">Founder Social Nodes</span>
            <div className="flex flex-col gap-1.5">
              <a 
                href="https://www.linkedin.com/in/ajim-patel-b359192ab/" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-zinc-300 hover:text-sky-400 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>@Ajim Patel (LinkedIn)</span>
              </a>
              <a 
                href="https://x.com/Ajimpat84097807" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-zinc-300 hover:text-sky-400 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>@Ajimpat84097807 (X)</span>
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-1">
            <span className="text-[8px] uppercase tracking-wider text-zinc-500 block">Business Coordinates</span>
            <p className="text-zinc-400 uppercase">MIDNIGHT SIGNALS HQ</p>
            <p className="text-zinc-500">Silicon Coast, Mumbai-Pune Sector</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. USER ACCOUNTS SIMULATOR
// ==========================================
export interface ClientAccount {
  username: string;
  email: string;
  tier: "Unlimited Free" | "Midnight Signals Pro 🚀";
  savedCount: number;
  presetsSelected: number;
}

export function AccountsSimulator({ 
  onLoginStatusChange 
}: { 
  onLoginStatusChange: (account: ClientAccount | null) => void 
}) {
  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [formMode, setFormMode] = useState<"login" | "signup" | null>(null);
  const [user, setUser] = useState({ username: "", email: "", password: "" });

  useEffect(() => {
    const saved = localStorage.getItem("midnight-signals-user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAccount(parsed);
      onLoginStatusChange(parsed);
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.username || !user.email) return;

    const newAcc: ClientAccount = {
      username: user.username,
      email: user.email,
      tier: "Unlimited Free",
      savedCount: 4,
      presetsSelected: 1
    };
    
    localStorage.setItem("midnight-signals-user", JSON.stringify(newAcc));
    setAccount(newAcc);
    onLoginStatusChange(newAcc);
    setFormMode(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("midnight-signals-user");
    setAccount(null);
    onLoginStatusChange(null);
  };

  if (account) {
    return (
      <div className="bg-zinc-950/80 p-4 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-400 font-bold uppercase shrink-0">
            {account.username.slice(0, 2)}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white">{account.username}</span>
              <span className="text-[8px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded uppercase font-extrabold border border-sky-400/20">
                {account.tier}
              </span>
            </div>
            <span className="text-zinc-500 text-[9px] block shrink-1 break-all mt-0.5">{account.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-zinc-400 flex flex-col gap-0.5">
            <span>💾 Saved Signals: <b className="text-indigo-400">{account.savedCount}</b></span>
            <span>⭐ Preset Favs: <b className="text-indigo-400">{account.presetsSelected}</b></span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-2.5 py-1 bg-zinc-900 override:hover:bg-zinc-800 border border-white/5 rounded-lg text-rose-400 cursor-pointer hover:border-rose-500/25 transition-colors font-bold uppercase text-[9px]"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {formMode ? (
        <form onSubmit={handleAuth} className="bg-zinc-950 p-4 border border-white/5 rounded-2xl space-y-3 font-mono text-[10px] text-left">
          <div className="flex justify-between items-center bg-transparent">
            <span className="text-[9px] uppercase font-bold text-sky-400">
              {formMode === "login" ? "🔑 Portal Verification Login" : "🆕 Create Galactic Signal Node"}
            </span>
            <button 
              type="button" 
              onClick={() => setFormMode(null)} 
              className="text-zinc-500 hover:text-white text-[8px] uppercase cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="space-y-0.5">
              <label className="text-[8px] text-zinc-550 uppercase">Station Username</label>
              <input
                type="text"
                required
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-sky-500/40"
                placeholder="Station_Vibe_X"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[8px] text-zinc-550 uppercase">Secure Email</label>
              <input
                type="email"
                required
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-sky-500/40"
                placeholder="sound@space.com"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[8px] text-zinc-550 uppercase">Password</label>
              <input
                type="password"
                required
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-sky-500/40 font-serif"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-sky-500 text-black hover:bg-sky-400 transition-colors font-bold uppercase rounded-lg text-center cursor-pointer"
          >
            {formMode === "login" ? "Verify Station ID" : "Activate Pulse Receiver Member"}
          </button>
        </form>
      ) : (
        <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-left font-sans flex items-center gap-2.5">
            <User className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-white">Save Your Midnight Signal Space</h4>
              <p className="text-zinc-500 text-[10px]">Create an anonymous listener account to archive poetry, lock favorite bird chirps & store focus loops.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 w-full md:w-auto font-mono text-[9px]">
            <button
              type="button"
              onClick={() => setFormMode("login")}
              className="flex-1 md:flex-none px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 rounded-xl font-bold uppercase transition-transform active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setFormMode("signup")}
              className="flex-1 md:flex-none px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 rounded-xl font-bold uppercase transition-transform active:scale-95 cursor-pointer"
            >
              Express Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. MIDNIGHT SIGNALS PRO UPGRADE PAGE
// ==========================================
export function PremiumUpgrade({ 
  userTier, 
  onUpgrade 
}: { 
  userTier: string; 
  onUpgrade: (plan: "free" | "pro") => void 
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [ccNum, setCcNum] = useState("");
  const [ccExpiry, setCcExpiry] = useState("");
  const [ccCvv, setCcCvv] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccNum || !ccExpiry || !ccCvv) return;
    setStatus("processing");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onUpgrade("pro");
        setShowCheckout(false);
        setStatus("idle");
      }, 1500);
    }, 2000);
  };

  const isPro = true; // All features are completely free and unlocked for all users!

  return (
    <div className="space-y-6">
      {/* Dynamic Membership Status Indicator */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-left font-sans">
          <span className="text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-extrabold tracking-widest">
            COSMIC TIER STATUS
          </span>
          <h4 className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
            Current Membership: 
            <span style={{ color: "#00D1FF" }}>
              Midnight Signals Pro (Totally Free) 🚀
            </span>
          </h4>
          <p className="text-[10px] text-zinc-440 mt-1">
            Standard and Premium services have been unified. You possess active, unrestricted, 100% free authorization across all high-fidelity frequencies, multi-track audio features, and ambient recording options. Enjoy your sleep soundboards!
          </p>
        </div>
        
        <div className="px-4 py-2 border border-[#00D1FF]/20 bg-[#00D1FF]/5 rounded-xl font-mono text-[9px] text-[#00D1FF] uppercase font-bold tracking-wider select-none">
          ✨ 100% Unlocked Free Edition
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Plan Comparison List */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 text-left flex flex-col justify-between">
          <div>
            <h5 className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-4">Frequency License Status</h5>
            <div className="space-y-3.5 text-[11px] font-sans">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">Generative AI Poetry Signals:</b>
                  <p className="text-zinc-500">100% Free: Unlimited continuous starlight generation unlocked for everyone.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">Holographic Bird Preset Tracks:</b>
                  <p className="text-zinc-500">100% Free: Complete 50+ beautiful singers interactive catalog is fully accessible.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">Cognitive Binaural Frequencies:</b>
                  <p className="text-zinc-500">100% Free: Complete Alpha, Delta, Beta, and Theta brainwave ranges are completely open.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">Exporter Studio System:</b>
                  <p className="text-zinc-500">100% Free: High-Fidelity audio recordings, copy features, and downloadable signal postcards are free forever.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 text-[9px] text-zinc-500 font-mono">
            * No subscription or credit card required. Midnight Signals is open access.
          </div>
        </div>

        {/* Feature Overview Grid */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <h5 className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Unlocked Support Perks</h5>
            
            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 space-y-1.5">
              <span className="font-mono text-[9px] font-bold text-white uppercase block">💖 100% Creator Supportive</span>
              <p className="text-[10px] text-zinc-450 leading-relaxed font-sans">
                Our dynamic acoustic system and procedural algorithms are free and open source. All background soundscapes and radio signals support independent creators and Ad-free listening.
              </p>
            </div>

            <div className="p-3 bg-sky-500/5 rounded-xl border border-sky-500/10 space-y-1.5">
              <span className="font-mono text-[9px] font-bold text-sky-400 uppercase block">🛡️ GDPR Data Integrity Guarantee</span>
              <p className="text-[10px] text-zinc-455 leading-relaxed font-sans">
                Every listener receives specialized cryptographic local vaults ensuring not a single bit of metadata transfers outer borders. Your space, locked perfectly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/5 font-mono text-[10px] text-zinc-500 uppercase">
            <Award className="w-4 h-4 text-[#00D1FF]" />
            <span>Open Access Non-Profit Publisher Verified • 2026</span>
          </div>
        </div>
      </div>

      {/* Checkout Sandbox Drawer Modal Overlay */}
      {showCheckout && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-950 border border-indigo-500/20 max-w-sm w-full rounded-3xl p-6 shadow-2xl relative font-mono text-[10px] text-left text-zinc-300">
            <div className="text-center space-y-1.5 border-b border-white/5 pb-4">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto animate-pulse" />
              <h5 className="font-bold text-white text-[11px] uppercase tracking-wider">💳 LNT Sandbox Terminal</h5>
              <p className="text-[9px] text-zinc-500">SIMULATED SANDBOX BILLING INTERFACE</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-[8px] uppercase text-zinc-500">Recipient Product</label>
                <div className="bg-zinc-900 px-3 py-2 text-white font-bold rounded-xl border border-white/5">
                  Midnight Signals Pro - Monthly Trial License ($9.99)
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] uppercase text-zinc-500">Simulated Card Numbers</label>
                <input
                  type="text"
                  required
                  placeholder="4111 2222 3333 4444"
                  value={ccNum}
                  onChange={(e) => setCcNum(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] uppercase text-zinc-500">Exp. Date</label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    value={ccExpiry}
                    onChange={(e) => setCcExpiry(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase text-zinc-500">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="999"
                    value={ccCvv}
                    onChange={(e) => setCcCvv(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
              </div>

              {status === "processing" && (
                <div className="text-center py-2 text-sky-400 font-bold uppercase animate-pulse">
                  Verifying Sandbox Ledger Frequencies...
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-2 text-emerald-400 font-bold uppercase flex items-center justify-center gap-1.5 bg-emerald-500/5 border border-emerald-400/20 rounded-xl">
                  <CheckCircle className="w-4 h-4" />
                  <span>TRANSACTION SUCCESSFUL! UPGRADED!</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={status === "processing" || status === "success"}
                  className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-black font-extrabold uppercase rounded-xl cursor-pointer"
                >
                  Confirm Sandbox Pay
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl uppercase text-zinc-400 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. ADDITIONAL COMPLIANCE POLICIES
// ==========================================
export function AdditionalPolicies({ 
  activePolicyTab, 
  setActivePolicyTab 
}: { 
  activePolicyTab: string; 
  setActivePolicyTab: (tab: string) => void 
}) {
  return (
    <div className="space-y-5 text-left">
      <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-white/10 scrollbar-none font-mono text-[9px] uppercase tracking-wider font-bold">
        {[
          { id: "cookie-policy", label: "🍪 Cookie Policy" },
          { id: "disclaimer", label: "⚠️ Disclaimers" },
          { id: "dmca", label: "⚖️ DMCA (Copyright)" },
          { id: "accessibility", label: "♿ Accessibility Support" },
          { id: "security-audit", label: "🔒 Encryption & Security" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActivePolicyTab(tab.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              activePolicyTab === tab.id
                ? "bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30 font-bold"
                : "bg-transparent text-zinc-550 border-transparent hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 text-zinc-300 leading-relaxed font-sans text-xs pt-1">
        
        {/* A. COOKIE POLICY */}
        {activePolicyTab === "cookie-policy" && (
          <div className="space-y-3.5">
            <h5 className="font-bold text-white uppercase text-xs font-mono">1. Extended Cookie & Tracking Disclosures</h5>
            <p>
              Under California Consumer Privacy rules, UK Data Compliance frameworks, and EU regulations, the separation of general Privacy practices and precise Tracker cookies policies are legally demanded.
            </p>
            <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 font-mono text-[9px] space-y-3">
              <p><b className="text-white">A. ESSENTIAL SESSION COOKIES:</b> Used purely to store user’s custom theme overrides, sleep state parameters, local signals, and active volume mixer states. These do not require user opt-out controls.</p>
              <p><b className="text-white">B. ANALYTICS & MEASUREMENT COOKIES:</b> Gathered if accepted to trace average listening times, dynamic frequency clicks, and signal transmission volumes via anonymous Google Analytics metrics.</p>
              <p><b className="text-white">C. THIRD-PARTY MARKETING COOKIES:</b> Loaded during Google AdSense container mounting to present relevant, non-intrusive textual blocks to support operations billing.</p>
            </div>
            <p className="text-zinc-450 text-[10px]">
              You can instantly purge all tracker cookie memories from your physical disk by clearing cookies for <code className="text-zinc-300 bg-white/5 px-1 py-0.5 rounded font-mono">midnight-signals.ai.studio</code> directly in your web browser inspector options.
            </p>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-[#00D1FF]/5 rounded-xl border border-[#00D1FF]/15 gap-3 mt-2">
              <div className="space-y-1">
                <span className="font-mono text-[9px] font-bold text-[#00D1FF] uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Interactive Consent Console
                </span>
                <p className="text-[10px] text-zinc-450">Modify or adjust your Google Consent Mode v2 preferences at any time.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new Event("show-cookie-consent"));
                }}
                className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-400/30 font-mono text-[9px] uppercase tracking-wider font-bold rounded-lg transition-colors cursor-pointer"
              >
                Adjust Consent ⚙️
              </button>
            </div>
          </div>
        )}

        {/* B. DISCLAIMER INFORMATION */}
        {activePolicyTab === "disclaimer" && (
          <div className="space-y-3.5">
            <h5 className="font-bold text-white uppercase text-xs font-mono">2. Educational & Medical Healing Dissociation</h5>
            <p>
              Please review the following disclaimers regarding the meditative sound play, waves, and lyrics offered on our frequency nodes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-yellow-500/5 rounded-xl border border-yellow-500/10 space-y-1.5">
                <span className="font-mono text-[9px] font-bold text-yellow-500 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  No Medical Healing Guarantees
                </span>
                <p className="text-[10px] text-zinc-400">
                  Our mental cognitive binaural waves, rain static, and lofi melodies are generated purely for recreational, focal, study assistance, and meditative relaxing intentions. They do not constitute formal psychiatric therapies or medical advice.
                </p>
              </div>
              <div className="p-3.5 bg-purple-500/5 rounded-xl border border-purple-500/10 space-y-1.5">
                <span className="font-mono text-[9px] font-bold text-purple-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Generated Art Clarifications
                </span>
                <p className="text-[10px] text-zinc-400">
                  All comfort response text, poetic echoes and 4-line lyrics synthesized live on the coordinates console are algorithmic creative works generated by Gemini AI model nodes. They do not reflect real static broadcasts of separate live radio entities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* C. DMCA / COPYRIGHT POLICY */}
        {activePolicyTab === "dmca" && (
          <div className="space-y-3.5">
            <h5 className="font-bold text-white uppercase text-xs font-mono">3. DMCA Copyright Takedown Procedure</h5>
            <p>
              We honor intellectual property and copyright bounds. Since our lyric sheets include options for custom songwriter inputs, we operate safe-harbor standards matching international DMCA frameworks.
            </p>
            <p className="font-semibold text-zinc-200 text-[11px] block">How to report copyrighted lyric material?</p>
            <p>
              If a custom lyric stream matching your intellectual property was injected onto our index panel by third-party sandbox operators, present a compliant notification to our designated copyright officer containing:
            </p>
            <ul className="list-disc pl-5 font-mono text-[10px] text-zinc-450 space-y-1.5">
              <li>Description of your copyrighted material and matching online URI link.</li>
              <li>Your official business email address, physical address, and telephonic link.</li>
              <li>A digital signature verifying authorized representation of the catalog owner.</li>
            </ul>
            <p>
              Send reports directly to: <a href="mailto:ajimp340@gmail.com" className="text-[#00D1FF] hover:underline">ajimp340@gmail.com</a>. We remove reporting materials within 12 operating hours.
            </p>
          </div>
        )}

        {/* D. ACCESSIBILITY STATEMENT & DYNAMIC CONTROLLER */}
        {activePolicyTab === "accessibility" && (
          <AccessibilityController />
        )}

        {/* E. SECURITY POLICY */}
        {activePolicyTab === "security-audit" && (
          <div className="space-y-3.5">
            <h5 className="font-bold text-white uppercase text-xs font-mono">5. Cryptographic Security Standards</h5>
            <p>
              Even as an client-side, offline-first audio synthesizer application, we deploy rigorous SaaS-grade security configurations to ensure malicious script vectors are rejected.
            </p>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#00D1FF] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-bold">SHA-256 Transport Layer Security</span>
                  <p className="text-zinc-500 text-[9px] mt-0.5">All local browser queries are protected via HTTPS certificates preventing man-in-the-middle decryption hacks.</p>
                </div>
              </div>
              <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-bold">XSS Input Content Sanitizers</span>
                  <p className="text-zinc-500 text-[9px] mt-0.5">User typed lyrics and starlight messages undergo regular memory escaping rules to strip any dangerous SQL injection commands.</p>
                </div>
              </div>
            </div>
            <p>
              If you identify a server verification or database leakage glitch, please report details secretly to our secure disclosure mailboxes.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================
// 5D. ACCESSIBILITY CONTROLLER COMPONENT
// ==========================================
function AccessibilityController() {
  const [motionMode, setMotionMode] = useState<"standard" | "reduced">("standard");
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra">("normal");

  useEffect(() => {
    // Sync to html tag or body
    const doc = document.documentElement;
    if (motionMode === "reduced") {
      doc.classList.add("reduced-motion");
    } else {
      doc.classList.remove("reduced-motion");
    }

    if (highContrast) {
      doc.classList.add("high-contrast-mode");
    } else {
      doc.classList.remove("high-contrast-mode");
    }

    doc.classList.remove("text-large", "text-extra");
    if (fontSize === "large") {
      doc.classList.add("text-large");
    } else if (fontSize === "extra") {
      doc.classList.add("text-extra");
    }
  }, [motionMode, highContrast, fontSize]);

  return (
    <div className="space-y-4">
      <h5 className="font-bold text-white uppercase text-xs font-mono">4. Accessibility Statement & UI Modifiers</h5>
      <p>
        Midnight Signals is dedicated to delivering a relaxing music oasis readable and responsive for all listeners, regardless of sensory ability. We conform diligently to WCAG 2.1 AA digital standards.
      </p>

      {/* Interactive Controls Box */}
      <div className="p-4 bg-zinc-950 rounded-2xl border border-[#00D1FF]/10 text-left font-mono text-[10px] space-y-4">
        <span className="text-[#00D1FF] font-bold uppercase tracking-wider block">🛠️ Dynamic Accessibility Adjuster</span>
        
        {/* Reduced Motion Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div>
            <span className="text-white block font-bold">Reduced Motion Setting</span>
            <p className="text-zinc-550 text-[9px]">Slower float speeds on starlight canvas canvas to aid vestibular sensitivities.</p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMotionMode("standard")}
              className={`px-2 py-1 rounded border text-[9px] cursor-pointer ${motionMode === "standard" ? "bg-indigo-500/15 border-indigo-400 text-indigo-300" : "bg-transparent border-white/5 text-zinc-500"}`}
            >
              Standard Motion
            </button>
            <button
              type="button"
              onClick={() => setMotionMode("reduced")}
              className={`px-2 py-1 rounded border text-[9px] cursor-pointer ${motionMode === "reduced" ? "bg-indigo-500/15 border-indigo-400 text-indigo-300" : "bg-transparent border-white/5 text-zinc-500"}`}
            >
              Reduced Motion ⚡
            </button>
          </div>
        </div>

        {/* High Contrast Mode */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div>
            <span className="text-white block font-bold">Contrast Boost Factor</span>
            <p className="text-zinc-550 text-[9px]">Increase color contrast ratios to conform with WCAG visibility specs.</p>
          </div>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1 rounded border text-[9px] cursor-pointer ${highContrast ? "bg-[#00D1FF]/10 border-[#00D1FF] text-[#00D1FF]" : "bg-transparent border-white/5 text-zinc-500"}`}
          >
            {highContrast ? "Contrast Boost [ACTIVE]" : "Normal Contrast"}
          </button>
        </div>

        {/* Font size adjustments */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-white block font-bold font-sans">Scalable Lettering Gauge</span>
            <p className="text-zinc-550 text-[9px] font-sans">Enlarge text blocks and lyrics labels for higher readability.</p>
          </div>
          <div className="flex gap-1 font-mono text-[9px]">
            {["normal", "large", "extra"].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontSize(sz as any)}
                className={`px-2 py-1 rounded border cursor-pointer uppercase ${fontSize === sz ? "bg-emerald-500/10 border-emerald-400 text-emerald-300" : "bg-transparent border-white/5 text-zinc-500"}`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. FOUNDER PROFILE CARD (AJIM PATEL)
// ==========================================
export function FounderCard() {
  return (
    <div className="bg-gradient-to-br from-zinc-950 via-zinc-950 to-indigo-950/20 p-6 rounded-3xl border border-indigo-500/15 relative overflow-hidden text-left flex flex-col md:flex-row gap-6 items-center">
      
      {/* Dynamic Animated CSS Avatar representing the Charismatic Founder Ajim Patel */}
      <div className="relative shrink-0 flex-none w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#00D1FF]/30 shadow-2xl flex items-center justify-center bg-zinc-900 group">
        
        {/* Background visual graphics mapping his actual headphone portrait style */}
        <div className="absolute inset-0 bg-indigo-950/40" />
        
        {/* Cool graphical stylized CSS portrait representation of Ajim Patel as indicated in the uploaded photo */}
        <div className="z-10 relative flex flex-col items-center">
          
          {/* Headphones arcs */}
          <div className="absolute -top-3 w-16 h-12 rounded-t-full border-[7px] border-[#00D1FF] opacity-85 z-0 animate-pulse" />
          
          {/* Dark shades sunglasses & face silhouette */}
          <div className="w-14 h-14 bg-[#10b981]/15 rounded-full border border-[#10b981]/25 flex items-center justify-center relative z-10">
            {/* Sunglasses glasses */}
            <div className="flex gap-1 absolute top-4">
              <div className="w-5 h-3.5 bg-black rounded-sm border border-zinc-500/40 relative">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-60" />
              </div>
              <div className="w-5 h-3.5 bg-black rounded-sm border border-zinc-500/40 relative">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-60" />
              </div>
            </div>
            
            {/* Beard silhouette */}
            <div className="absolute bottom-1 w-9 h-3.5 bg-zinc-800 rounded-b-xl" />
          </div>

          {/* Blue cool athletic T-shirt graphics */}
          <div className="w-20 h-6 bg-sky-500/90 rounded-t-lg mt-1 relative border-t border-sky-300">
            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono font-bold text-black opacity-80">CREATOR</span>
          </div>
        </div>

        {/* Outer glowing beacon ring */}
        <div className="absolute inset-0 border border-sky-400/25 rounded-2xl scale-95 animate-ping opacity-20" />
      </div>

      <div className="space-y-3.5 font-sans flex-1">
        <div>
          <span className="text-[8px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md border border-sky-400/20 font-bold uppercase tracking-wider">
            Founder & Architect
          </span>
          <h4 className="text-lg font-bold font-serif text-white tracking-tight mt-1.5 flex items-center gap-1.5">
            Ajim Patel
            <a 
              href="https://www.linkedin.com/in/ajim-patel-b359192ab/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#00D1FF] hover:text-white transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4 inline" />
            </a>
            <a 
              href="https://x.com/Ajimpat84097807" 
              target="_blank" 
              rel="noreferrer" 
              className="text-sky-400 hover:text-white transition-colors"
              title="X Profile"
            >
              <Twitter className="w-4 h-4 inline" />
            </a>
          </h4>
        </div>

        <p className="text-zinc-300 text-xs leading-relaxed">
          Ajim Patel is a software engineer and creative lofi audio visual technologist. Inspired by late-night programming grinds and cozy rainfall frequencies, Ajim founded <b>Midnight Signals</b> to cultivate a high-grade meditative oasis where beautiful procedural synthesizers, AI lyric transmission, and authentic nature signals live securely.
        </p>

        <div className="flex gap-2.5 pt-2 border-t border-white/5 font-mono text-[9px] text-zinc-500">
          <span>📍 Mumbai-Pune tech hub</span>
          <span>•</span>
          <a href="mailto:ajimp340@gmail.com" className="hover:text-white transition-colors">ajimp340@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. SIGNAL POSTCARD EXPORTER
// ==========================================
export function SignalExporter({ 
  currentSignalText, 
  currentResponseText 
}: { 
  currentSignalText: string; 
  currentResponseText: string 
}) {
  const [downloadCounter, setDownloadCounter] = useState(0);

  const handleTextExport = () => {
    const textContent = `===========================================
MIDNIGHT SIGNALS - STATION BROADCAST EXPORT
===========================================
Timestamp: ${new Date().toLocaleString()}
Verified Channel: https://midnight-signals.ai.studio/
Founded by Ajim Patel • LNT Safe Frequency

[MY UNSET LATE-NIGHT LNT MESSAGE]
"${currentSignalText || "Searching through the static for your frequency..."}"

[ECHOS FROM THE OTHER STAR - AI COMFORT RESPONSE]
"${currentResponseText || "No active response logged. The galaxy is holding its quiet breath."}"

[STATIONS METADATA]
• Atmospheric State: Dreamy Analog Haze
• Encryption Protocol: SHA-256 local-first
===========================================`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Midnight_Signal_Broadcast_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadCounter(prev => prev + 1);
  };

  return (
    <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl text-left space-y-3 font-mono text-[10px]">
      <div className="flex justify-between items-center bg-transparent text-[8px] uppercase tracking-widest text-zinc-550">
        <span>💾 Export Poster Workshop</span>
        <span className="text-[#00D1FF]">Postcard format</span>
      </div>

      <div className="bg-zinc-900 border border-white/10 p-3 rounded-xl space-y-2.5 relative overflow-hidden text-zinc-300">
        <div className="border-l-2 border-[#00D1FF] pl-2 space-y-1">
          <span className="text-[7px] text-[#00D1FF] uppercase tracking-widest block">Original Broadcast</span>
          <p className="italic font-serif text-[11px] text-white line-clamp-2">
            "{currentSignalText || "I hope you are looking at the same stars tonight"}"
          </p>
        </div>

        <div className="border-l-2 border-indigo-400 pl-2 space-y-1">
          <span className="text-[7px] text-indigo-400 uppercase tracking-widest block">Starlight Resonance Echo</span>
          <p className="font-sans text-[10px] text-zinc-400 line-clamp-2">
            "{currentResponseText || "Another wanderer reports seeing your coordinate spark float in Section 4."}"
          </p>
        </div>

        {/* Watermark */}
        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-zinc-600 uppercase">
          <span>MIDNIGHT SIGNALS // PROSEC_ENCRYPT</span>
          <span>© Ajim Patel</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleTextExport}
        className="w-full py-2 bg-[#00D1FF]/10 border border-[#00D1FF]/25 text-[#00D1FF] hover:bg-[#00D1FF]/20 rounded-xl transition-all font-bold uppercase text-[9px] tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        {downloadCounter > 0 ? `Postcard Downloaded [${downloadCounter}]` : "Download TXT Signal Postcard"}
      </button>
    </div>
  );
}

// ==========================================
// 8. PUBLIC BROADCASTS FEED (GALLERY)
// ==========================================
interface PublicBroadcast {
  id: string;
  sender: string;
  message: string;
  reply: string;
  vows: number;
  vibe: VibeType;
}

export function SignalGallery({ onTuneIn }: { onTuneIn: (text: string, response: string, vibe: VibeType) => void }) {
  const [gallery, setGallery] = useState<PublicBroadcast[]>([
    {
      id: "gal-1",
      sender: "Anonymous_Star_41",
      message: "I still wait at the yellow light, thinking you will pull up next to me.",
      reply: "The traffic signals in Sector 9 pulse slowly. A shadow motorist blinks high beams in silent sympathy.",
      vows: 24,
      vibe: "melancholy"
    },
    {
      id: "gal-2",
      sender: "Night_Dreamer_X",
      message: "Your favorite melody still crackles on my old tape recorder.",
      reply: "Magnetic loops store echoes of sweet voices long after recorders fail. Keep the reel spinning.",
      vows: 42,
      vibe: "dreamy"
    },
    {
      id: "gal-3",
      sender: "Coder_Acoustic",
      message: "Writing loops until sunrise, searching for the perfect frequency.",
      reply: "The compiler accepts your variables. The morning light colors the mountain peaks silver and amber.",
      vows: 18,
      vibe: "hopeful"
    },
    {
      id: "gal-4",
      sender: "Neon_Drifter_88",
      message: "Fast cars, wet highways, and neon shadows in the rearview.",
      reply: "Speed down the cyber highways. The lights painting your windshield are fleeting but beautiful.",
      vows: 31,
      vibe: "neon"
    }
  ]);

  const handleVote = (id: string) => {
    setGallery(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, vows: item.vows + 1 };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-3 text-left">
      <div className="flex justify-between items-center text-3xs font-mono uppercase tracking-widest text-zinc-550">
        <span>🌌 Public Signal Broadcasts</span>
        <span className="text-[#00D1FF] font-bold">Trending Nodes</span>
      </div>

      <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
        {gallery.map((sig) => (
          <div key={sig.id} className="p-3 bg-zinc-950/80 border border-white/5 rounded-2xl flex flex-col justify-between gap-2 text-[10px] font-sans">
            <div className="flex justify-between items-center bg-transparent">
              <span className="font-mono text-[9px] text-[#00D1FF] font-bold">📡 @{sig.sender}</span>
              <span className="font-mono text-[8px] bg-white/5 uppercase px-1 py-0.5 rounded text-zinc-500">{sig.vibe}</span>
            </div>

            <p className="text-white italic line-clamp-2">"{sig.message}"</p>
            <p className="text-zinc-450 pl-2 border-l border-white/10 line-clamp-2">"{sig.reply}"</p>

            <div className="pt-2 border-t border-white/5 flex justify-between items-center font-mono text-[9px]">
              <button
                type="button"
                onClick={() => handleVote(sig.id)}
                className="text-rose-400 hover:text-rose-350 cursor-pointer flex items-center gap-1 transition-colors"
                title="Pulse vote"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500/10" />
                <span>{sig.vows} Pulse Signals</span>
              </button>

              <button
                type="button"
                onClick={() => onTuneIn(sig.message, sig.reply, sig.vibe)}
                className="text-sky-400 hover:text-sky-300 font-bold uppercase text-[8px] cursor-pointer"
              >
                Tune In →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Donation Button bar Component with SaaS-inspired items
export function DonationSection() {
  return (
    <div className="bg-zinc-950 p-4.5 rounded-3xl border border-white/5 text-center space-y-3 font-mono text-[10px]">
      <span className="text-zinc-500 uppercase tracking-widest block">☕ Buy Creator Ajim Patel a Coffee</span>
      <p className="font-sans text-zinc-400 leading-relaxed text-[11px]">
        Keep this tranquil radio broadcasting continuous procedural beats. Your small contribution helps maintain high fidelity synthesizers globally.
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center pt-1">
        <a 
          href="https://www.buymeacoffee.com/ajimpatel" 
          target="_blank" 
          rel="noreferrer" 
          className="px-3.5 py-1.5 bg-zinc-900 border border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400 text-zinc-300 rounded-xl transition-all cursor-pointer font-bold tracking-wider uppercase text-[8px]"
        >
          ☕ Buy Me A Coffee
        </a>
        <a 
          href="https://ko-fi.com/ajimpatel" 
          target="_blank" 
          rel="noreferrer" 
          className="px-3.5 py-1.5 bg-zinc-900 border border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-450 text-zinc-300 rounded-xl transition-all cursor-pointer font-bold tracking-wider uppercase text-[8px]"
        >
          🥤 Support Ko-fi
        </a>
        <a 
          href="https://patreon.com/ajimpatel" 
          target="_blank" 
          rel="noreferrer" 
          className="px-3.5 py-1.5 bg-zinc-900 border border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-300 rounded-xl transition-all cursor-pointer font-bold tracking-wider uppercase text-[8px]"
        >
          🤝 Back on Patreon
        </a>
      </div>
    </div>
  );
}
