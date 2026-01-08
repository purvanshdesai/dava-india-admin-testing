import React, { useState } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table'
import { Button } from '../ui/button'
// import { CircleAlert } from 'lucide-react'
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger
// } from '@/components/ui/tooltip'
// import dayjs from 'dayjs'

// const columns = {
//   STORE_CODE: 'Store Code',
//   AREA_NAME: 'Area Name',
//   DATE: 'Date',
//   GST_NO: 'GST No.',
//   STATE: 'State',
//   PRODUCT_CODE: 'Product Code',
//   PRODUCT_NAME: 'Product Name',
//   GENERIC_NAME: 'Generic Name',
//   PRODUCT_CATEGORY: 'Product Category',
//   PACK_SIZE: 'Pack Size',
//   BATCH_NO: 'Batch No.',
//   EXPIRY_DATE: 'Expiry Date',
//   MRP: 'MRP',
//   PURCHASE_RATE: 'Purchase Rate',
//   TOTAL_AMOUNT: 'Total Amount',
//   CITY: 'City',
//   QUANTITY: 'Quantity'
// }

const InventoryBulkUploadTable = ({
  handleInsertSheetData,
  excelData
}: any) => {
  const [uploadButtonClicked, setUploadButtonClicked] = useState<boolean>(false)

  const UploadExcelFile = async () => {
    handleInsertSheetData()
  }

  return (
    <div>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 px-4 pt-6 md:flex'>
        <div className='flex flex-row items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Bulk Upload Inventory
          </h2>

          <div className='flex items-center gap-4'></div>
        </div>
        <div className='space-y-2'>
          <div className='flex gap-2'>
            <strong>Total records:</strong>
            {excelData?.totalRecords}
          </div>
          <div className='flex gap-2'>
            <strong>Valid records:</strong>
            {excelData?.validRows}
          </div>
          <div className='flex gap-2'>
            <strong>InValid records:</strong>
            {excelData?.invalidRows}
          </div>

          <div className='pt-6'>
            <Button
              type='button'
              disabled={uploadButtonClicked}
              className=''
              onClick={() => {
                setUploadButtonClicked(true)
                UploadExcelFile()
              }}
            >
              <p>Upload Valid Records</p>
            </Button>
          </div>
        </div>

        {/* <Table>
          <TableHeader>
            <TableRow>
              <TableHead key={'error'} className={'w-5'}></TableHead>
              {Object.values(columns).map((c: string, index: number) => (
                <TableHead key={index}>{c}</TableHead>
              ))}
              <TableHead key={'currentQty'}>Current Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {excelData?.rows?.map((row: any, index: number) => (
              <TableRow
                key={index}
                className={`${row.error ? 'bg-yellow-300' : ''}`}
              >
                <TableCell className={'bg-white'}>
                  {row.error && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className={
                              'flex h-6 w-6 items-center justify-center rounded-full bg-yellow-300'
                            }
                          >
                            <CircleAlert color={'#FFF'} className={''} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className={'flex flex-col p-2'}>
                            {Object.entries(row.error).map(
                              ([col, errMsg]: any, rowErrorIdx) => (
                                <div key={rowErrorIdx} className={'flex'}>
                                  <div className={'w-32 font-semibold'}>
                                    {excelData?.columnMapInverted[col]}:
                                  </div>
                                  <div>{errMsg}</div>
                                </div>
                              )
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                {Object.values(columns).map(
                  (c: string, columnIndex: number) => (
                    <TableCell
                      key={columnIndex}
                      className={`${row.error && row.error[excelData.columnMap[c]] ? 'text-red-500' : ''}`}
                    >
                      {c === columns.EXPIRY_DATE
                        ? excelDateToJSDate(row[excelData.columnMap[c]])
                        : row[excelData.columnMap[c]]}
                    </TableCell>
                  )
                )}
                <TableCell key={'currentQty'}>{row['batchStock']}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table> */}
      </div>
    </div>
  )
}

export default InventoryBulkUploadTable
