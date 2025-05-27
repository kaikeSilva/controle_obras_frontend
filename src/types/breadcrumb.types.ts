export interface BreadcrumbItem {
    type: string
    id: number
    name: string
    route: string
    params: Record<string, string>
    query: Record<string, string>
    meta: Record<string, string>
}