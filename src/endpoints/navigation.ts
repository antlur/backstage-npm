import type { ApiSingleResponse, ApiCollectionResponse, Navigation, NavigationItem } from "../types/index";
import { BaseService } from "./base.js";

export interface CreateNavigationParams {
  name: string;
  items?: Array<Partial<NavigationItem> & { parent_id?: string | null }>;
  [key: string]: any;
}

export interface UpdateNavigationParams extends Partial<CreateNavigationParams> {}

export class NavigationService extends BaseService {
  async list(options?: RequestInit): Promise<Navigation[]> {
    const res = await this.client.get<ApiCollectionResponse<Navigation>>("/navigations", options);
    return res.data;
  }

  async getById(id: string, options?: RequestInit): Promise<Navigation | null> {
    try {
      const res = await this.client.get<ApiSingleResponse<Navigation>>(`/navigations/${id}`, options);
      return res.data;
    } catch (error) {
      return null;
    }
  }

  async createNavigation(params: CreateNavigationParams, options?: RequestInit): Promise<Navigation> {
    const { data } = await this.client.post<ApiSingleResponse<Navigation>>("/navigations", params, options);
    return data;
  }

  async updateNavigation(id: string, params: UpdateNavigationParams, options?: RequestInit): Promise<Navigation> {
    const { data } = await this.client.put<ApiSingleResponse<Navigation>>(`/navigations/${id}`, params, options);
    return data;
  }

  async getNavigations(options?: RequestInit): Promise<Navigation[]> {
    const navigations = await this.list(options);

    return Promise.all(
      navigations.map(async (navigation: any) => {
        const res = await this.client.get<ApiCollectionResponse<Navigation>>("/navigations/" + navigation.id, options);
        return res.data[0];
      }),
    );
  }

  async getDefaultNavigation(options?: RequestInit): Promise<Navigation> {
    const navigations = await this.getNavigations(options);
    return navigations[0];
  }

  async getNavigation(id: string, options?: RequestInit): Promise<Navigation> {
    const res = await this.client.get<ApiSingleResponse<Navigation>>(`/navigations/${id}`, options);
    const navigation = res.data;

    const topLevelItems = navigation.items.filter((item: any) => item.parent_id === null);

    topLevelItems.forEach((item: any) => {
      item.children = navigation.items.filter((child: any) => child.parent_id === item.id);
    });

    navigation.items = topLevelItems;

    return navigation;
  }
}
