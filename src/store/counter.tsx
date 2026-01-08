import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CounterState {
  bears: number
  increase: (by: number) => void
}

const useCounterStore = create<CounterState>()(
  devtools(
    set => ({
      bears: 0,
      increase: by => set(state => ({ bears: state.bears + by }))
    }),
    {
      name: 'counter-storage'
    }
  )
)

export default useCounterStore
