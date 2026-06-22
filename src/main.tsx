import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isSupabaseConfigured } from "./integrations/supabase/client";

const rootEl = document.getElementById("root")!;

if (!isSupabaseConfigured) {
  // Render a visible, friendly error instead of a blank page when the Supabase
  // build-time env vars are missing. Inline styles are used so the message shows
  // even if app styling fails to load.
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#0b0b0f;color:#e7e7ea;">
      <div style="max-width:560px;">
        <h1 style="font-size:1.5rem;margin:0 0 12px;">Configuration error</h1>
        <p style="margin:0 0 12px;line-height:1.5;color:#b8b8c0;">
          This site can't connect to its data backend because the required build-time
          environment variables are missing.
        </p>
        <p style="margin:0 0 8px;line-height:1.5;color:#b8b8c0;">Set these in the build configuration and redeploy:</p>
        <ul style="margin:0 0 12px 18px;line-height:1.7;">
          <li><code>VITE_SUPABASE_URL</code></li>
          <li><code>VITE_SUPABASE_PUBLISHABLE_KEY</code></li>
        </ul>
        <p style="margin:0;line-height:1.5;color:#8a8a93;font-size:0.9rem;">
          These are inlined by Vite at build time, so they must be present when the
          site is built — not just at runtime.
        </p>
      </div>
    </div>
  `;
} else {
  createRoot(rootEl).render(<App />);
}
