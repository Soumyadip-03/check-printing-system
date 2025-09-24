// Template parser - return template as-is since we're using the standard format
export const parseTemplate = (template) => {
  if (!template || !template.fields) return null;
  return template;
};