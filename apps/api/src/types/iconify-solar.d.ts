// Type the Solar dataset via getIconData's parameter (IconifyJSON) so tsc never has to infer a
// type for the 7k-icon JSON literal (which would be prohibitively slow).
declare module '@iconify-json/solar/icons.json' {
  const data: Parameters<typeof import('@iconify/utils').getIconData>[0];
  export default data;
}
