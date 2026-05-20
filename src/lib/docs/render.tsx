export const Render = ({ children }: { children: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: children }}></div>;
};
