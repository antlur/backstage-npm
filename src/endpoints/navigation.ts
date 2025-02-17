import { ApiSingleResponse, ApiCollectionResponse, Navigation } from "../types";
import { BaseService } from "./base.js";

export class NavigationService extends BaseService {
  async getNavigations(): Promise<Navigation[]> {
    const res = await this.client.get<ApiCollectionResponse<Navigation>>("/navigations");
    const navigations = res.data;

    return Promise.all(
      navigations.map(async (navigation: any) => {
        const res = await this.client.get<ApiCollectionResponse<Navigation>>("/navigations/" + navigation.id);
        return res.data[0];
      })
    );
  }

  async getDefaultNavigation(): Promise<Navigation> {
    const navigations = await this.getNavigations();
    return navigations[0];
  }

  async getNavigation(id: string): Promise<Navigation> {
    const res = await this.client.get<ApiSingleResponse<Navigation>>(`/navigations/${id}`);
    const navigation = res.data;

    const topLevelItems = navigation.items.filter((item: any) => item.parent_id === null);

    topLevelItems.forEach((item: any) => {
      item.children = navigation.items.filter((child: any) => child.parent_id === item.id);
    });

    navigation.items = topLevelItems;

    return navigation;
  }
}
