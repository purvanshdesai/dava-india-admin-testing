import { create } from 'zustand'

interface TableFilterState {
  filters: object
  setFilters: (by: number) => void
}

const useTableFilterStore = create<TableFilterState>()(set => ({
  filters: {},
  setFilters: (by: any) => set(() => ({ filters: by }))
}))

export default useTableFilterStore
