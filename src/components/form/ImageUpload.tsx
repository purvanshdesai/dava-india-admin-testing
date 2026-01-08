import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { toast } from '@/hooks/use-toast'

interface ImageUpload {
  onChange?: any
  onUploadNewFiles?: any
  onRemoveFile?: any
  onRemoveNewFile?: any
  existingFiles?: Array<string>
  multiple?: boolean
  imageContainerStyle?: string
  imageStyle?: string
  hideSelect?: boolean
  allowedAspectRatio?: Array<number> | null // [width, height]
}

const ImageUpload = ({
  onChange,
  onUploadNewFiles,
  onRemoveFile,
  onRemoveNewFile,
  multiple = false,
  existingFiles = [],
  imageContainerStyle,
  imageStyle,
  hideSelect = false,
  allowedAspectRatio = null
}: ImageUpload) => {
  const [uploadedImages, setUploadedImages] = useState<Array<File | any>>([])

  const acceptedFormats: any = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml'
  ]

  useEffect(() => {
    const eFiles = uploadedImages.filter(f => f?.isExisting)

    if (eFiles.length === existingFiles.length) return

    setUploadedImages(
      existingFiles.map(url => {
        return { isExisting: true, url }
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

  const isValidRatio = async (validFiles: File[]) => {
    try {
      if (!allowedAspectRatio || allowedAspectRatio?.length !== 2) return

      const TOLERANCE = 0.02 // Tolerance for aspect ratio validation
      const ACCEPTED_RATIOS = allowedAspectRatio[0] / allowedAspectRatio[1] // Example ratio (16:9)

      const results = await Promise.all(
        validFiles.map(
          file =>
            new Promise(resolve => {
              // Check image dimensions
              const img = document.createElement('img')

              img.onload = () => {
                const ratio = img.width / img.height
                console.log(
                  'Img Ratio',
                  ratio,
                  Math.abs(ratio - ACCEPTED_RATIOS)
                )

                if (Math.abs(ratio - ACCEPTED_RATIOS) > TOLERANCE) {
                  console.log('Invalid aspect ratio')
                  resolve(false) // Resolve with false
                } else {
                  console.log('Valid aspect ratio')
                  resolve(true) // Resolve with true
                }
              }

              img.onerror = () => {
                console.error('Error loading image:', file.name)
                resolve(false) // Resolve with false in case of error
              }

              img.src = URL.createObjectURL(file)
            })
        )
      )

      // Check if all files are valid
      return results.every(isValid => isValid)
    } catch (error) {
      console.error('Error validating files:', error)
      return false
    }
  }

  // Handle the dropped files
  const onDrop = useCallback(
    async (acceptedFiles: Array<File>) => {
      const validFiles = acceptedFiles.filter(file =>
        acceptedFormats.includes(file.type)
      )
      const invalidFiles = acceptedFiles.length > validFiles.length

      if (invalidFiles) {
        toast({
          title: 'Oops!',
          description:
            'Only JPEG, JPG, PNG, GIF, and SVG image formats are allowed.'
        })
        return // Exit early if any invalid files are present
      }

      if (allowedAspectRatio && allowedAspectRatio?.length == 2) {
        const isValid = await isValidRatio(validFiles)

        console.log('isValid', isValid)

        if (!isValid) {
          toast({
            title: 'Oops!',
            description: `Add image with aspect ratio of ${allowedAspectRatio[0]}/${allowedAspectRatio[1]}`
          })
          return // Exit early if any invalid files are present
        }
      }

      const imageData = validFiles.map(file =>
        Object.assign(file, {
          isNewFile: true,
          preview: URL.createObjectURL(file)
        })
      )

      if (multiple) {
        setUploadedImages([...imageData, ...uploadedImages])
        onUploadNewFiles && onUploadNewFiles(imageData)
      } else {
        setUploadedImages([imageData[0]])
        onUploadNewFiles && onUploadNewFiles(imageData, uploadedImages[0])
      }
    },
    [multiple, uploadedImages, onUploadNewFiles]
  )

  // Configure Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.svg', '.gif', '.jpg']
    },
    onDrop
  })

  // Remove image preview URL to avoid memory leaks
  const removeImage = (image: File | any) => {
    setUploadedImages(uploadedImages.filter(img => img !== image))
    URL.revokeObjectURL(image?.preview)
    if (onRemoveFile && image?.isExisting) onRemoveFile(image)
    if (onRemoveNewFile && image?.isNewFile) onRemoveNewFile(image)
  }

  const getImages = () => {
    if (multiple) return uploadedImages
    return uploadedImages?.length ? uploadedImages.slice(0, 1) : []
  }

  return (
    <div className='image-upload-container'>
      {!hideSelect && (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-md border-2 border-dashed p-6 ${
            isDragActive ? 'border-green-500' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className='text-green-500'>Drop the files here...</p>
          ) : (
            <p className='text-label'>
              Drag & drop some files here, or click to select files
            </p>
          )}
        </div>
      )}

      {/* Preview uploaded images */}
      <div className={`mt-4 flex items-center gap-4 ${imageContainerStyle}`}>
        {[...getImages()].map((image, index) => {
          return (
            <div
              key={index}
              className={`relative h-40 w-40 rounded-md border p-2 ${imageStyle}`}
            >
              <Image
                src={image?.isExisting ? image?.url : image?.preview}
                alt={`Uploaded image ${index + 1}`}
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                style={{ objectFit: 'contain' }}
              />
              <button
                onClick={e => {
                  e.preventDefault()
                  removeImage(image)
                }}
                className='absolute right-0 top-0 h-6 w-6 rounded-full bg-red-500 text-white'
              >
                X
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ImageUpload
