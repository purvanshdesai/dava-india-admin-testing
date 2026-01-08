export type TPaginateResponse<TData> = {
  data: TData
  total: number
}

export type UploadedObject = {
  _id: string
  storageService: string
  objectUrl: string
  objectDetails: {
    size: number
    fileName: string
    originalFileName: string
    mimeType: string
  }
}
