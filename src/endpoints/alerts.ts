import { ApiCollectionResponse, Alert } from "../types";
import { BaseService } from "./base";

export class AlertService extends BaseService {
  async getAlerts(): Promise<Alert[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Alert>>("/alerts");
    return data;
  }
}
