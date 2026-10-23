declare module "virtual:buttery-search/titles" {
  /** The docs search's titles index as MiniSearch JSON: titles, keywords and each result's place. */
  const json: string;
  export default json;
}

declare module "virtual:buttery-search/text" {
  /** The docs search's full-text index as MiniSearch JSON. */
  const json: string;
  export default json;
}
