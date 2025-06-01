export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
}
  
export interface PaginationLinks {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
}

export interface PaginationMeta {
    current_page?: number;
    from?: number;
    last_page?: number;
    links?: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path?: string;
    per_page?: number;
    to?: number;
    total?: number;
}
  
export interface PaginationParams {
    page?: number;
    per_page?: number;
}
  
export interface SortingParams {
    sort_by?: string;
    direction?: 'asc' | 'desc';
}
  