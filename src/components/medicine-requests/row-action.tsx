'use client'

import { EyeIcon } from 'lucide-react'
import { Row } from '@tanstack/react-table'
import { requestMedicineSchema } from '@/components/ui/DataTable/data/schema'
import Link from 'next/link'
import { Button } from '../ui/button'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

interface DataTableRowActionsProps<TData> {
  table?: any
  row: Row<TData>
  setOpen?: any
}

export function DataTableRowActions<TData>({
  table,
  row
}: DataTableRowActionsProps<TData>) {
  const user = requestMedicineSchema.parse(row.original)

  const hasReadPermission = hasPermission(
    MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
    MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.READ_MEDICINE_REQUEST
  )
  const hasEditPermission = hasPermission(
    MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
    MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.EDIT_MEDICINE_REQUEST
  )

  if (!hasReadPermission && !hasEditPermission) {
    return null
  }

  return (
    <Link
      href={`/settings/medicine-requests/${user._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`}
      className='flex items-center gap-2 text-sm'
    >
      <Button variant={'link'} className='flex items-center gap-1' size={'sm'}>
        <EyeIcon size={16} />
        View
      </Button>
    </Link>
  )
}
