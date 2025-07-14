"use client"

import { useState, useEffect } from "react"
import { Filter, ArrowDown, MoreHorizontal } from "lucide-react"

const StatusBadge = ({ status }: { status: string }) => {
  const styles: { [key: string]: string } = {
    Baik: "bg-success-light text-success",
    Rusak: "bg-danger-light text-danger",
    "Dalam Perbaikan": "bg-warning-light text-warning",
    "Perlu Diganti": "bg-info-light text-info",
  }
  return <span className={`px-3 py-1 text-xs font-bold rounded-full ${styles[status]}`}>{status}</span>
}

const ActionMenu = ({ equipment, onStatusChange, onUseBackup }: any) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(equipment.equipment_id, newStatus, "Admin User", `Status changed to ${newStatus}`)
    setIsOpen(false)
  }

  const handleUseBackup = () => {
    onUseBackup(equipment.equipment_id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-gray-600 font-bold">
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
          <div className="py-1">
            <button
              onClick={() => handleStatusChange("Baik")}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Mark as Good
            </button>
            <button
              onClick={() => handleStatusChange("Rusak")}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Mark as Broken
            </button>
            <button
              onClick={() => handleStatusChange("Dalam Perbaikan")}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Mark as Under Repair
            </button>
            <button
              onClick={() => handleStatusChange("Perlu Diganti")}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Mark as Needs Replacement
            </button>
            <hr className="my-1" />
            <button
              onClick={handleUseBackup}
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left"
            >
              Use Backup Equipment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const InventoryTable = ({ equipment, onStatusChange, onUseBackup }: any) => {
  const [filteredEquipment, setFilteredEquipment] = useState(equipment || [])
  const [filterText, setFilterText] = useState("")

  useEffect(() => {
    if (equipment) {
      const filtered = equipment.filter(
        (item: any) =>
          item.name.toLowerCase().includes(filterText.toLowerCase()) ||
          item.category?.category_name?.toLowerCase().includes(filterText.toLowerCase()),
      )
      setFilteredEquipment(filtered)
    }
  }, [equipment, filterText])

  if (!equipment) {
    return <div className="bg-white p-6 rounded-xl border border-gray-200 mt-6">Loading...</div>
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-neutral-heading">Daftar Inventaris</h2>
        <div className="relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by name or category"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-neutral-bg border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3 font-semibold flex items-center">
                <span className="mr-1">Nama Alat</span>
                <ArrowDown size={14} />
              </th>
              <th className="p-3 font-semibold">Kategori</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Jumlah</th>
              <th className="p-3 font-semibold">Lokasi</th>
              <th className="p-3 font-semibold">Pemeliharaan Terakhir</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.map((item: any, index: number) => (
              <tr key={item.equipment_id || index} className="border-b border-gray-100 last:border-0">
                <td className="p-3 font-medium text-neutral-heading">{item.name}</td>
                <td className="p-3 text-neutral-text">{item.category?.category_name || "N/A"}</td>
                <td className="p-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="p-3 text-neutral-heading font-medium">{item.quantity}</td>
                <td className="p-3 text-neutral-text">{item.location || "N/A"}</td>
                <td className="p-3 text-neutral-text">
                  {item.last_maintenance ? new Date(item.last_maintenance).toLocaleDateString("id-ID") : "Belum ada"}
                </td>
                <td className="p-3">
                  <ActionMenu equipment={item} onStatusChange={onStatusChange} onUseBackup={onUseBackup} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-8 text-gray-500">No equipment found matching your filter.</div>
      )}
    </div>
  )
}

export default InventoryTable
