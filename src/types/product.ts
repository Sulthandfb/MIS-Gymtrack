export interface ProductStats {
  total_products: number
  total_supplements: number
  weekly_sales: number
  low_stock: number
}

export interface TopSalesData {
  name: string
  sales: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
}

export interface SalesTrendData {
  day: string
  sales: number
}

export interface ProductInsight {
  title: string
  text: string
  recommendation?: string
  borderColor?: string
}

export interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: number
  stock: number
  sold: number
  margin: number
}

export interface SegmentationData {
  product: string
  weightLoss: number
  muscleGain: number
  endurance: number
}

export interface CrossSellData {
  baseProduct: string
  relatedProduct: string
  confidence: number
}
