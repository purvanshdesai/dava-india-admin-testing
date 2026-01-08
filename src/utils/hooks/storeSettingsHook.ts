import { useMutation } from '@tanstack/react-query'
import { updateStoreSettings } from '../actions/storeSettings'

export const usePatchStoreSettings = () => {
  return useMutation({
    mutationFn: updateStoreSettings
  })
}
