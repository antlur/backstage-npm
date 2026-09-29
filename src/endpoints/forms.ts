import type { ApiSingleResponse, FormDefinition } from "../types/index";
import { BaseService } from "./base.js";

export interface FormSubmissionData {
  [key: string]: any;
}

export class FormService extends BaseService {
  async getFormDefinition(formId: string, options?: RequestInit): Promise<FormDefinition> {
    const { data } = await this.client.get<ApiSingleResponse<FormDefinition>>(
      `/forms/${encodeURIComponent(formId)}`,
      options,
    );

    return data;
  }

  async submitForm(formId: string, data: FormSubmissionData, options?: RequestInit): Promise<any> {
    const response = await this.client.post(`/wa/forms/${formId}`, data, options);
    return response;
  }
}
