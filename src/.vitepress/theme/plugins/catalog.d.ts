declare module '@site/catalog' {
  interface CatalogItem {
    path: string
    title: string
  }

  export default function(pagePath: string): CatalogItem[]
}
