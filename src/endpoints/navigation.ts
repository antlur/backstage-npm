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
      navigations.map(({ id }) => this.getNavigation(id, options)),
    );
  }

  async getDefaultNavigation(options?: RequestInit): Promise<Navigation> {
    const navigations = await this.getNavigations(options);
    return navigations[0];
  }

  async getNavigation(id: string, options?: RequestInit): Promise<Navigation> {
    const res = await this.client.get<ApiSingleResponse<Navigation>>(`/navigations/${id}`, options);
    const navigation = res.data;

    const itemsByParent = new Map<string | null, NavigationItem[]>();

    navigation.items.forEach((item) => {
      const parentId = item.parent_id as string | null;
      const siblings = itemsByParent.get(parentId) ?? [];
      siblings.push(item);
      itemsByParent.set(parentId, siblings);
    });

    const buildTree = (item: NavigationItem): NavigationItem => ({
      ...item,
      children: (itemsByParent.get(item.id) ?? []).map(buildTree),
    });

    return {
      ...navigation,
      items: (itemsByParent.get(null) ?? []).map(buildTree),
    };
  }
}
