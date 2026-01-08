import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

export default function AlertBox({
  openState,
  title = 'Are you absolutely sure?',
  content,
  onCancel,
  onContinue,
  cancelButtonText = 'Cancel',
  continueButtonText = 'Continue'
}: {
  openState: any[]
  title?: string
  content: string
  onCancel?: () => void
  onContinue: (data?: any) => void
  cancelButtonText?: string
  continueButtonText?: string
}) {
  const [open, setOpen] = openState
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setOpen(false)
              if (onCancel) onCancel()
            }}
          >
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setOpen(false)
              if (onContinue) onContinue()
            }}
          >
            {continueButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
