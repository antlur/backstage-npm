import type { Page } from "@/types";

export function PageMeta(props: { page: Page }) {
  const { meta } = props.page;

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
    </>
  );
}
