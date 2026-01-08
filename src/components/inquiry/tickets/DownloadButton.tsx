'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { exportData } from '@/utils/actions/exportsAction'
import { downloadFileFromURL } from '@/lib/utils'
import { ColumnFiltersState } from '@tanstack/react-table'
import { DateRange } from 'react-day-picker'
import moment from 'moment'

interface DownloadButtonProps {
  columnFilters: ColumnFiltersState
  dateRange?: DateRange
  dateFilterType?: string
}

export default function DownloadButton({
  columnFilters,
  dateRange,
  dateFilterType
}: DownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsExporting(true)

      toast({
        title: 'Starting Export',
        description:
          'Generating Excel file from the backend. This may take a moment...'
      })

      // Call backend export service
      const res = await exportData({
        exportFor: 'inquiries',
        filters: {
          dateRange: dateRange,
          dateFilterType: dateFilterType,
          columnFilters: columnFilters
        }
      })

      if (!res?.filePath) {
        toast({
          title: 'Download Error',
          description: 'There was an error downloading the inquiries',
          variant: 'destructive'
        })
        return
      }

      // Download the file from the URL
      await downloadFileFromURL(
        res.filePath,
        `Davaindia-inquiries-report-${moment().format('DD-MM-YYYY')}.xlsx`
      )

      toast({
        title: 'Success',
        description: 'Successfully exported inquiries to Excel.'
      })
    } catch (error) {
      console.error('Error downloading tickets:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isExporting}
      variant='outline'
      className='gap-2'
    >
      {isExporting ? (
        <>
          <Loader2 className='h-4 w-4 animate-spin' />
          Exporting...
        </>
      ) : (
        <>
          <Download className='h-4 w-4' />
          Download Excel
        </>
      )}
    </Button>
  )
}
