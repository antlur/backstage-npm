export function createAstroRendererScaffold(): string {
  return `---
type HeroBlock = {
  fields: {
    eyebrow?: string | null;
    heading?: string | null;
    body?: string | null;
    image?: { url: string; alt?: string | null } | null;
    primary_action_label?: string | null;
    primary_action_url?: string | null;
  };
};

const { block } = Astro.props as { block: HeroBlock };
const { eyebrow, heading, body, image, primary_action_label, primary_action_url } = block.fields;

function safeHref(value?: string | null) {
  if (!value) return undefined;

  try {
    const url = new URL(value, "https://backstage.invalid");
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}

const actionHref = safeHref(primary_action_url);
---

<div>
  {image?.url && <img src={image.url} alt={image.alt ?? ""} />}
  {eyebrow && <p>{eyebrow}</p>}
  {heading && <h2>{heading}</h2>}
  {body && <p>{body}</p>}
  {primary_action_label && actionHref && <a href={actionHref}>{primary_action_label}</a>}
</div>
`;
}
