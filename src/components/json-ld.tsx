interface JsonLdProps {
  schema: any;
  id: string;
}

export function JsonLd({ schema, id }: JsonLdProps) {
  const schemaString = JSON.stringify(schema);
  return <script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaString }}></script>;
}
