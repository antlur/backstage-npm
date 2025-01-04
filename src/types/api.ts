export interface ApiCollectionResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
  };
}

export interface ApiSingleResponse<T> {
  data: T;
}
