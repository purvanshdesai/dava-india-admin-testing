import { useMutation } from '@tanstack/react-query'
import { handleUploadInvoice } from '../actions/uploadInvoiceAction'

export const useUploadInvoice = () => {
  return useMutation({
    mutationFn: handleUploadInvoice
  })
}
