import type { ApiCollectionResponse, Alert } from "../types/index";
import { BaseService } from "./base.js";

export class AlertService extends BaseService {
  async getAlerts(): Promise<Alert[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Alert>>("/alerts");
    return data;
  }
}
