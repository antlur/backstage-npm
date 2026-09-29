export type FormDefinitionOption = string | {
  label?: string | null;
  value?: string | null;
  [key: string]: unknown;
};

export interface FormDefinitionField {
  id: string;
  name: string | null;
  label: string;
  type: string;
  required: boolean;
  options: FormDefinitionOption[] | null;
  order: number;
}

/** Public rendering definition; excludes recipient and delivery configuration. */
export interface FormDefinition {
  id: string;
  title: string;
  type: string;
  action: string;
  redirect_url: string | null;
  recaptcha_site_key: string | null;
  fields: FormDefinitionField[];
}
