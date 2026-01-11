import { getGlobalConfig, BackstageUserConfig } from "./config.js";
import { AlertService } from "./endpoints/alerts.js";
import { AuthService } from "./endpoints/auth.js";
import { BlocksService } from "./endpoints/blocks.js";
import { BlueprintsService } from "./endpoints/blueprints.js";
import { EntryService } from "./endpoints/entries.js";
import { EventService } from "./endpoints/events.js";
import { FormService } from "./endpoints/forms.js";
import { InstagramService } from "./endpoints/instagram.js";
import { LayoutService } from "./endpoints/layouts.js";
import { LocationService } from "./endpoints/locations.js";
import { MenuService } from "./endpoints/menus.js";
import { NavigationService } from "./endpoints/navigation.js";
import { PageService } from "./endpoints/pages.js";
import { PressService } from "./endpoints/press.js";
import { RedirectService } from "./endpoints/redirects.js";
import { RouteService } from "./endpoints/routes.js";
import { WebsiteService } from "./endpoints/website.js";
import { MediaService } from "./endpoints/media.js";

export class BackstageClient {
  private baseURL: string;
  private token: string;
  private accountId: string;
  private onError?: (error: Error) => void;

  // Service Instances
  public readonly alerts: AlertService;
  public readonly auth: AuthService;
  public readonly blocks: BlocksService;
  public readonly blueprints: BlueprintsService;
  public readonly entries: EntryService;
  public readonly events: EventService;
  public readonly forms: FormService;
  public readonly instagram: InstagramService;
  public readonly layouts: LayoutService;
  public readonly locations: LocationService;
  public readonly media: MediaService;
  public readonly menus: MenuService;
  public readonly navigation: NavigationService;
  public readonly pages: PageService;
  public readonly press: PressService;
  public readonly redirects: RedirectService;
  public readonly routes: RouteService;
  public readonly website: WebsiteService;

  constructor(config?: BackstageUserConfig) {
    // If no config is passed, try to get from the global config
    const globalConfig = getGlobalConfig();
    const finalConfig = config || globalConfig;

    if (!finalConfig) {
      throw new Error("No Backstage config found. Please call defineConfig() or pass config to BackstageClient.");
    }

    // check for token and accountId in the config
    if (!finalConfig.token) {
      throw new Error("No token found in the Backstage config. Please provide a token.");
    }

    if (!finalConfig.accountId) {
      throw new Error("No accountId found in the Backstage config. Please provide an accountId.");
    }

    this.baseURL = finalConfig.baseURL!;
    this.token = finalConfig.token;
    this.accountId = finalConfig.accountId;
    this.onError = finalConfig.onError;

    // Initialize service instances
    this.alerts = new AlertService(this);
    this.auth = new AuthService(this);
    this.blocks = new BlocksService(this);
    this.blueprints = new BlueprintsService(this);
    this.entries = new EntryService(this);
    this.events = new EventService(this);
    this.forms = new FormService(this);
    this.instagram = new InstagramService(this);
    this.layouts = new LayoutService(this);
    this.locations = new LocationService(this);
    this.media = new MediaService(this);
    this.menus = new MenuService(this);
    this.navigation = new NavigationService(this);
    this.pages = new PageService(this);
    this.press = new PressService(this);
    this.redirects = new RedirectService(this);
    this.routes = new RouteService(this);
    this.website = new WebsiteService(this);
  }

  private async request<T = unknown>(method: string, url: string, data?: unknown, options?: RequestInit): Promise<T> {
    const fullUrl = `${this.baseURL}${url}`;
    const defaultHeaders: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      "X-Account-ID": this.accountId,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const fetchOptions: RequestInit = {
      method,
      headers: { ...defaultHeaders, ...options?.headers },
      ...options,
    };

    if (data && !fetchOptions.body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      fetchOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, fetchOptions);
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        (error as any).status = response.status;
        (error as any).response = { status: response.status, data: errorText };
        if (this.onError) this.onError(error);
        throw error;
      }
      return await response.json();
    } catch (error) {
      if (this.onError) this.onError(error as Error);
      throw error;
    }
  }

  public async get<T = unknown>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>("GET", url, undefined, options);
  }

  public async post<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>("POST", url, data, options);
  }

  public async put<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>("PUT", url, data, options);
  }

  public async patch<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>("PATCH", url, data, options);
  }

  public async delete<T = unknown>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>("DELETE", url, undefined, options);
  }
}
