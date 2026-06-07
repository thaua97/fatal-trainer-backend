export type SortBy =
  | 'price'
  | 'rating'
  | 'distance'
  | 'name'
  | 'reviewCount'
  | 'experienceYears'
  | 'discount'

export type SortOrder = 'asc' | 'desc'
export type PriceView = 'session' | 'monthly'

export interface ListQuery {
  search?: string
  specialties?: string[]
  modalities?: string[]
  minPrice?: number
  maxPrice?: number
  minRating?: number
  city?: string
  maxDistanceKm?: number
  onPromotion?: boolean
  priceView?: PriceView
  sortBy: SortBy
  sortOrder: SortOrder
  page: number
  pageSize: number
}

export const DEFAULT_PRICE_VIEW: PriceView = 'session'

export const DEFAULT_LIST_QUERY: ListQuery = {
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  pageSize: 20,
  priceView: DEFAULT_PRICE_VIEW,
}

export class ListQueryVO {
  constructor(public readonly value: ListQuery) {}

  static fromParams(params: Record<string, string | string[] | undefined>): ListQueryVO {
    return new ListQueryVO(parseListQuery(params))
  }
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (value == null) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseQueryArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.flatMap((entry) => entry.split(',')).filter(Boolean)
  }
  return value.split(',').filter(Boolean)
}

function parseQueryBoolean(value: string | undefined): boolean | undefined {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

function parseSortBy(value: string | undefined): SortBy {
  const allowed: SortBy[] = [
    'price',
    'rating',
    'distance',
    'name',
    'reviewCount',
    'experienceYears',
    'discount',
  ]
  return allowed.includes(value as SortBy) ? (value as SortBy) : DEFAULT_LIST_QUERY.sortBy
}

export function parseListQuery(
  queryParams: Record<string, string | string[] | undefined>,
): ListQuery {
  const search = typeof queryParams.search === 'string' ? queryParams.search : undefined

  return {
    search,
    specialties: parseQueryArray(queryParams.specialties),
    modalities: parseQueryArray(queryParams.modalities),
    minPrice: parseOptionalNumber(
      typeof queryParams.minPrice === 'string' ? queryParams.minPrice : undefined,
    ),
    maxPrice: parseOptionalNumber(
      typeof queryParams.maxPrice === 'string' ? queryParams.maxPrice : undefined,
    ),
    minRating: parseOptionalNumber(
      typeof queryParams.minRating === 'string' ? queryParams.minRating : undefined,
    ),
    city: typeof queryParams.city === 'string' ? queryParams.city : undefined,
    maxDistanceKm: parseOptionalNumber(
      typeof queryParams.maxDistanceKm === 'string' ? queryParams.maxDistanceKm : undefined,
    ),
    onPromotion: parseQueryBoolean(
      typeof queryParams.onPromotion === 'string' ? queryParams.onPromotion : undefined,
    ),
    priceView:
      typeof queryParams.priceView === 'string' && queryParams.priceView === 'monthly'
        ? 'monthly'
        : DEFAULT_PRICE_VIEW,
    sortBy: parseSortBy(typeof queryParams.sortBy === 'string' ? queryParams.sortBy : undefined),
    sortOrder:
      typeof queryParams.sortOrder === 'string' && queryParams.sortOrder === 'desc' ? 'desc' : 'asc',
    page: parseNumber(typeof queryParams.page === 'string' ? queryParams.page : undefined, 1),
    pageSize: parseNumber(
      typeof queryParams.pageSize === 'string' ? queryParams.pageSize : undefined,
      DEFAULT_LIST_QUERY.pageSize,
    ),
  }
}
