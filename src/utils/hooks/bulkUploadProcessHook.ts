import { useQuery } from '@tanstack/react-query'
import { getBulkUploadProcess } from '../actions/bulkUploadActions'

export const useGetBulkUploadProcess = (query: any) => {
  return useQuery({
    queryFn: () => getBulkUploadProcess(query),
    queryKey: ['fetch-bulk-upload-process', query, query?.timestamp]
  })
}
