import Image from 'next/image'
import { UploadedObject } from '../../../types/type'
import { Trash2 } from 'lucide-react'

const UploadImagePreview = ({
  object,
  width = 150,
  height = 150,
  removeFile
}: {
  object: UploadedObject
  width?: number | `${number}` | undefined
  height?: number | `${number}` | undefined
  removeFile: () => void
}) => {
  return (
    <div className={'relative flex items-center'}>
      <div className='absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full p-1 text-center text-red-600 hover:bg-white'>
        <button type={'button'} className={'text-sm'} onClick={removeFile}>
          <Trash2 width={16} />
        </button>{' '}
      </div>
      <Image
        src={object?.objectUrl}
        alt={object?.objectDetails?.originalFileName}
        width={width}
        height={height}
      />
    </div>
  )
}

export default UploadImagePreview
