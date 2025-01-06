import { GAEvents } from "../constants/google-events";

// Define gtag on window
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function gtag(...args: any[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

interface GtagEventParams {
  category?: string;
  label?: string;
  value?: number;
  page_url?: string;
  /** @deprecated Use category instead */
  event_category?: string;
  /** @deprecated Use label instead */
  event_label?: string;
}

type GtagEventName = keyof typeof GAEvents | (string & {});

export function gtagEvent(name: GtagEventName, params: GtagEventParams = {}) {
  if (typeof window === "undefined" || !window.gtag) return;

  gtag("event", name, params);
}
