import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// Reusable FormDialog component
export default function FormDialog({
  title,
  content,
  footerActions,
  trigger,
  footerNotReq = false,
  className,
  isOpen,
  onOpenChange
}: {
  title?: string
  content: any
  footerActions: any
  trigger?: any
  footerNotReq?: boolean
  className?: string
  isOpen?: any
  onOpenChange?: any
}) {
  // const [isOpen, setIsOpen] = useState(false)

  const closeDialog = () => {
    onOpenChange(false)
  }

  // const openDialog = () => {
  //   setIsOpen(true)
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={
          (cn(footerNotReq ? '' : 'divide-y-2', 'md:w-[900px]', className),
          'sm:max-w-[500px]')
        }
      >
        {title ? (
          <DialogHeader className={cn(footerNotReq ? 'border-b-2 pb-3' : '')}>
            <DialogTitle className='text-md capitalize'>{title}</DialogTitle>
          </DialogHeader>
        ) : null}
        <div className={(cn(footerNotReq ? 'py-2' : 'py-4'), 'grid gap-4')}>
          {content}
        </div>
        <DialogFooter className={cn(footerNotReq ? '' : 'border-t-2 pt-4')}>
          {footerActions ? footerActions(closeDialog) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
