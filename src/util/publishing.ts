export function filterPublishedItems(items: any[]) {
  return items.filter((item) => item.published_at !== null);
}
