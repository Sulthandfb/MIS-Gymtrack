"use client"

import { useEffect, useState } from "react"
import { Search, Download, Filter, SortAsc, Package, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchProducts } from "@/services/api"
import type { Product } from "@/types/product"

export function ProductListTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("bestseller")

  useEffect(() => {
    loadProducts()
  }, [categoryFilter, sortBy])

  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProducts({
        category: categoryFilter,
        lowStock: false,
        sortBy: sortBy,
      })
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      console.error("Error loading products:", err)
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Habis", color: "bg-red-500", textColor: "text-red-700" }
    if (stock < 10) return { label: "Rendah", color: "bg-orange-500", textColor: "text-orange-700" }
    if (stock < 50) return { label: "Normal", color: "bg-blue-500", textColor: "text-blue-700" }
    return { label: "Tinggi", color: "bg-green-500", textColor: "text-green-700" }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "suplemen":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "alat":
        return "bg-green-100 text-green-800 border-green-200"
      case "aksesori":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">Memuat data produk...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <span className="text-red-800 font-semibold text-lg">Error loading products</span>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadProducts} className="bg-red-600 hover:bg-red-700">
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Daftar Produk</h1>
                <p className="text-gray-600">Lihat seluruh data produk dan performa terkini</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 bg-white">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                Filter & Pencarian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {/* Search Bar - Full Width */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari nama produk atau brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                  />
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11">
                        <SelectValue placeholder="Semua Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        <SelectItem value="supplement">Suplemen</SelectItem>
                        <SelectItem value="equipment">Alat</SelectItem>
                        <SelectItem value="accessory">Aksesori</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11">
                        <SortAsc className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Urutkan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bestseller">Terlaris</SelectItem>
                        <SelectItem value="cheapest">Termurah</SelectItem>
                        <SelectItem value="newest">Terbaru</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Produk ({filteredProducts.length})</CardTitle>
                <Badge variant="outline" className="text-sm px-3 py-1 border-gray-300 bg-gray-50">
                  Total: {products.length} produk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-2/5">
                          Produk
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-1/6">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider w-1/6">
                          Harga
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider w-1/8">
                          Stok
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider w-1/8">
                          Terjual
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider w-1/8">
                          Margin
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product, index) => {
                        const stockStatus = getStockStatus(product.stock)
                        return (
                          <tr
                            key={product.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-150`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <div className="text-sm font-semibold text-gray-900 mb-1 truncate pr-4">
                                  {product.name}
                                </div>
                                {product.brand && (
                                  <div className="text-xs text-gray-500 font-medium truncate pr-4">{product.brand}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge className={`${getCategoryColor(product.category)} font-medium border text-xs whitespace-nowrap`}>
                                {product.category}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(product.price)}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`text-sm font-bold ${stockStatus.textColor}`}>{product.stock}</span>
                                <div
                                  className={`w-2 h-2 rounded-full ${stockStatus.color} flex-shrink-0`}
                                  title={stockStatus.label}
                                ></div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-semibold text-gray-900">{product.sold}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`text-sm font-bold ${
                                  product.margin > 50
                                    ? "text-green-600"
                                    : product.margin > 30
                                      ? "text-blue-600"
                                      : "text-orange-600"
                                }`}
                              >
                                {product.margin}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-lg m-4">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm
                      ? `Tidak ada produk yang sesuai dengan pencarian "${searchTerm}"`
                      : "Belum ada produk yang ditambahkan ke dalam sistem"}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Hapus Filter
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}