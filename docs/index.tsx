import Landing from "./_landing";

export const frontmatter = {
  pageType: "custom",
};

export default async () => {
  const landingHtml = await Landing.hydratable({}, { name: "Landing", snapshot: true });
  return <div dangerouslySetInnerHTML={{ __html: landingHtml }}></div>;
};
