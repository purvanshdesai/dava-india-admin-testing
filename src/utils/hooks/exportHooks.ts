import { useMutation } from '@tanstack/react-query'
import { exportData } from '../actions/exportsAction'

export const useExportData = () => {
  return useMutation({
    mutationFn: exportData
  })
}
