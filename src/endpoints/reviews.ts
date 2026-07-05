import type {
  ApiCollectionResponse,
  ApiSingleResponse,
  Review,
} from "../types/index";
import { BaseService } from "./base.js";

export interface CreateReviewParams {
  response_text: string;
}

export interface ReviewFilters {
  source?: string;
  location_id?: string;
}

export class ReviewService extends BaseService {
  async getReviews(filters?: ReviewFilters, options?: RequestInit): Promise<Review[]> {
    const query = new URLSearchParams();
    if (filters?.source) query.append("source", filters.source);
    if (filters?.location_id) query.append("location_id", filters.location_id);

    const queryString = query.toString();
    const url = queryString ? `/reviews?${queryString}` : "/reviews";

    const { data } = await this.client.get<ApiCollectionResponse<Review>>(
      url,
      options
    );
    return data;
  }

  async getReview(id: string, options?: RequestInit): Promise<Review | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<Review>>(
        `/reviews/${id}`,
        options
      );
      return data;
    } catch {
      return null;
    }
  }

  async updateReview(id: string, params: CreateReviewParams, options?: RequestInit): Promise<Review> {
    const { data } = await this.client.put<ApiSingleResponse<Review>>(
      `/reviews/${id}`,
      params,
      options
    );
    return data;
  }

  async pullReviews(options?: RequestInit): Promise<{ message: string }> {
    return this.client.post<{ message: string }>("/reviews/pull", {}, options);
  }
}
