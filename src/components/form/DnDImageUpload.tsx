import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, FileUp } from 'lucide-react'

interface ImageUpload {
  onChange?: any
  onUploadNewFiles?: any
  onRemoveFile?: any
  existingFiles?: Array<string>
  multiple?: boolean
  imageContainerStyle?: string
  imageStyle?: string
  onClickImage?: any
  preSelectedImage?: string
  onFileOrderChange?: any
  disabled?: boolean
}

const ImageUpload = ({
  onChange,
  onUploadNewFiles,
  onRemoveFile,
  multiple = false,
  existingFiles = [],
  imageContainerStyle,
  imageStyle,
  onClickImage,
  preSelectedImage,
  onFileOrderChange,
  disabled = false
}: ImageUpload) => {
  const [uploadedImages, setUploadedImages] = useState<Array<File | any>>([])
  const [selectedImage, setSelectedImage] = useState<string>()

  // console.log('uploadedImages', uploadedImages)

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const target = e.target as HTMLElement

      // Check if the focused element is an input or textarea
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return // Allow default text paste behavior
      }

      e.preventDefault()

      setUploadedImages(prevUploadedImages => {
        const items = e?.clipboardData?.items ?? []
        const imageFiles = []

        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.type.startsWith('image')) {
            const file = item.getAsFile()
            if (!file) continue
            const randomName = `image-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
            const renamedFile = new File([file], randomName, {
              type: file.type
            })

            if (renamedFile) {
              const imageFile: any = Object.assign(renamedFile, {
                isNewFile: true,
                path: randomName,
                preview: URL.createObjectURL(renamedFile),
                index: prevUploadedImages.length + imageFiles.length
              })
              imageFiles.push(imageFile)
            }
          }
        }

        if (imageFiles.length > 0) {
          if (multiple) {
            const newUploadedImages = [...prevUploadedImages, ...imageFiles]
            if (onUploadNewFiles) onUploadNewFiles(imageFiles)
            return newUploadedImages
          } else {
            if (onUploadNewFiles)
              onUploadNewFiles(imageFiles, prevUploadedImages[0])
            return [imageFiles[0]]
          }
        }

        return prevUploadedImages
      })
    },
    [onUploadNewFiles, multiple]
  )

  useEffect(() => {
    const eFiles = uploadedImages.filter(f => f.isExisting)

    if (existingFiles?.length && preSelectedImage && !selectedImage)
      setSelectedImage(preSelectedImage)
    if (eFiles.length === existingFiles.length) return

    setUploadedImages(
      existingFiles.map((url, index) => {
        return { isExisting: true, url, index }
      })
    )
  }, [existingFiles])

  useEffect(() => {
    if (onChange) {
      const allFiles = [...uploadedImages]
      if (multiple) onChange(allFiles)
      else onChange(allFiles[0])
    }
  }, [multiple])

  // Handle the dropped files
  const onDrop = useCallback(
    (acceptedFiles: Array<File>) => {
      const imageFiles = acceptedFiles.map((file, index) =>
        Object.assign(file, {
          isNewFile: true,
          preview: URL.createObjectURL(file),
          index: uploadedImages.length + index
        })
      )

      if (multiple) {
        setUploadedImages([...uploadedImages, ...imageFiles])

        if (onUploadNewFiles) onUploadNewFiles(imageFiles)
      } else {
        setUploadedImages([imageFiles[0]])
        if (onUploadNewFiles) onUploadNewFiles(imageFiles, uploadedImages[0])
      }
    },
    [uploadedImages, onChange]
  )

  useEffect(() => {
    if (onFileOrderChange)
      onFileOrderChange(
        uploadedImages.map(img => ({
          index: img.index,
          url: img.url ?? img.preview,
          isExisting: img.isExisting,
          fileName: img.path
        }))
      )
  }, [uploadedImages])

  useEffect(() => {
    window.addEventListener('paste', handlePaste)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [])

  // Configure Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
    onDrop
  })

  // Remove image preview URL to avoid memory leaks
  const removeImage = (image: File | any) => {
    setUploadedImages(
      uploadedImages
        .filter(img => img !== image)
        .map((img, index) => ({ ...img, index }))
    )
    URL.revokeObjectURL(image?.preview)
    if (onRemoveFile) onRemoveFile(image)
  }

  const getImages = () => {
    if (multiple) return uploadedImages
    return uploadedImages?.length ? uploadedImages.slice(0, 1) : []
  }

  const moveImageLeftOrRight = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index <= 0) ||
      (direction === 'right' && index >= uploadedImages.length - 1)
    ) {
      return uploadedImages // No move possible
    }

    const newIndex = direction === 'left' ? index - 1 : index + 1

    // Swap elements
    const array = [...uploadedImages]
    ;[array[index], array[newIndex]] = [array[newIndex], array[index]]
    setUploadedImages(array.map((img, index) => ({ ...img, index })))

    return array
  }

  return (
    <div className='image-upload-container'>
      <div
        className={`mt-4 flex items-center gap-4 ${imageContainerStyle} py-3`}
      >
        {[...getImages()].map((image, index) => {
          return (
            <div
              key={index}
              className={`relative h-40 w-40 rounded-md border ${imageStyle} ${selectedImage && (selectedImage === image?.url || selectedImage === image.preview) ? 'border-primary' : ''}`}
            >
              <Image
                className='p-2'
                src={image?.isExisting ? image.url : image.preview}
                alt={`Uploaded image ${index + 1}`}
                fill
                objectFit='contain'
                onClick={() => {
                  // setSelectedImage(image?.url ?? image?.preview)
                  // onClickImage && onClickImage(image)
                }}
              />
              {!disabled && (
                <button
                  onClick={e => {
                    e.preventDefault()
                    removeImage(image)
                  }}
                  className='absolute right-1 top-1 h-6 w-6 rounded-full bg-red-500 text-white'
                >
                  X
                </button>
              )}
              {!disabled && (
                <ChevronLeft
                  className={
                    'absolute left-0 top-16 mx-1 cursor-pointer rounded-full bg-orange-200 px-1 hover:bg-primary'
                  }
                  onClick={() => {
                    // if (onClickMoveImage) onClickMoveImage(image, 'left')
                    moveImageLeftOrRight(index, 'left')
                  }}
                />
              )}
              {!disabled && (
                <ChevronRight
                  className={
                    'absolute right-0 top-16 mx-1 cursor-pointer rounded-full bg-orange-200 px-1 hover:bg-primary'
                  }
                  onClick={() => {
                    // if (onClickMoveImage) onClickMoveImage(image, 'right')
                    moveImageLeftOrRight(index, 'right')
                  }}
                />
              )}
              {!disabled && (
                <div
                  className='absolute bottom-2 right-2 cursor-pointer'
                  onClick={() => {
                    setSelectedImage(image?.url ?? image?.preview)
                    onClickImage && onClickImage(image)
                  }}
                >
                  {selectedImage &&
                  (selectedImage === image?.url ||
                    selectedImage === image.preview) ? (
                    <Image
                      src='/images/selectedThumbnail.svg'
                      alt=''
                      width={20}
                      height={20}
                    />
                  ) : (
                    <Image
                      src='/images/selectThumbnail.svg'
                      alt=''
                      width={20}
                      height={20}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {getImages().length && !disabled ? (
        <div className={'label pb-3 text-xs italic text-gray-500'}>
          <Image
            src='/images/selectThumbnail.svg'
            alt=''
            width={20}
            height={20}
            className='inline'
          />{' '}
          Click the icon to make the image the thumbnail
        </div>
      ) : null}

      {!disabled && (
        <div
          {...getRootProps()}
          className={
            'flex h-48 w-1/2 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6'
          }
        >
          <input {...getInputProps()} />

          {isDragActive ? (
            <p className='text-gray-500'>Drop the files here...</p>
          ) : (
            <div className={'flex items-center gap-3'}>
              <div>
                <FileUp className={'text-primary'} size={64} strokeWidth={1} />
              </div>
              <div className={'flex flex-col'}>
                <Button
                  variant={'outline'}
                  className={'w-20 border-gray-300 text-gray-500'}
                  onClick={e => e.preventDefault()}
                >
                  Browse
                </Button>
                <div className={'text-sm text-gray-500'}>
                  Or drag and drop image here
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageUpload
