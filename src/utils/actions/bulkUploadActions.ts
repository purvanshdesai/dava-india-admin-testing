import api from '@/lib/axios'

export const getBulkUploadProcess = async (query: any) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit == undefined ? 10 : query.$limit,
      $skip: query.$skip == undefined ? 0 : query.$skip,
      query: {}
    }
    if (query.filters) {
      for (const filter of query.filters) {
        if (filter.id == 'name') {
          reqQuery.query[filter.id] = {
            $regex: filter.value,
            $options: 'i'
          }
        }
      }
    }
    const res = await api.get('/bulk-upload-process', { params: reqQuery })
    return res.data
  } catch (error) {
    throw error
  }
}
