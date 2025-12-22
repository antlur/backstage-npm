import { BaseService } from "./base.js";

export interface FormSubmissionData {
  [key: string]: any;
}

export class FormService extends BaseService {
  async submitForm(formId: string, data: FormSubmissionData, options?: RequestInit): Promise<any> {
    const response = await this.client.post(`/wa/forms/${formId}`, data, options);
    return response;
  }
}
