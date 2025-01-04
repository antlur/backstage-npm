import { client } from "../client";
import { ApiSingleResponse, ApiCollectionResponse, Navigation } from "../types";

export async function getDefaultNavigation(): Promise<Navigation> {
  const navigations = await getNavigations();
  return navigations[0];
}

export async function getNavigations(): Promise<Navigation[]> {
  const res = await client().get<ApiCollectionResponse<Navigation>>("/navigations");
  const navigations = res.data;

  return Promise.all(
    navigations.map(async (navigation: any) => {
      const res = await client().get<ApiCollectionResponse<Navigation>>("/navigations/" + navigation.id);
      return res.data[0];
    })
  );
}

export async function getNavigation(id: string): Promise<Navigation> {
  const res = await client().get<ApiSingleResponse<Navigation>>(`/navigations/${id}`);
  const navigation = res.data;

  const topLevelItems = navigation.items.filter((item: any) => item.parent_id === null);

  topLevelItems.forEach((item: any) => {
    item.children = navigation.items.filter((child: any) => child.parent_id === item.id);
  });

  navigation.items = topLevelItems;

  return navigation;
}
