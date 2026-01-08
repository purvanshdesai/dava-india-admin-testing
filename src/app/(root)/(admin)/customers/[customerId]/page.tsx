'use client'
import React, { useEffect, useState } from 'react'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Plus, CoinsIcon } from 'lucide-react'
import {
  useFetchUserById,
  useCreditDavaCoinsToUser
} from '@/utils/hooks/userHooks'
import { useParams } from 'next/navigation'
import AppBreadcrumb from '@/components/Breadcrumb'

// Types
type User = {
  _id: string
  email: string
  phoneNumber?: string
  accountVerified?: boolean
  createdAt?: string
  updatedAt?: string
  hasDavaoneMembership?: boolean
  davaCoinsBalance?: number
  identifierType?: string
  profileToken?: string
  dateOfBirth?: string | null
  gender?: string
  name?: string
}

type CoinRecord = {
  customerId: string
  action: string
  orderId?: string
  usageType: 'credit' | 'debit' | string
  coins: number
  description?: string
  createdAt: string
}

// Props for the page component
export default function UserDetailsPage() {
  const params = useParams<{ customerId: string }>()

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number | ''>('')
  const [coinAddNote, setCoinAddNote] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [localBalance, setLocalDavaCoinBalance] = useState<number>(0)
  const [coinRecords, setCoinRecords] = useState<CoinRecord[]>([])

  const { data } = useFetchUserById(params?.customerId)
  const { mutateAsync: creditDavaCoinsToUser, isPending: isAdding } =
    useCreditDavaCoinsToUser()

  useEffect(() => {
    if (data) {
      setUser(data as User)
      setLocalDavaCoinBalance(data?.davaCoinsBalance)
      setCoinRecords(data?.coinHistory ?? [])
    }
  }, [data])

  function formatDate(dt?: string) {
    if (!dt) return '-'
    try {
      return format(new Date(dt), 'dd MMM yyyy, HH:mm')
    } catch {
      return dt
    }
  }

  async function handleAddCoins() {
    if (!amount || Number(amount) <= 0) return

    const newRecord: CoinRecord = {
      customerId: params.customerId,
      action: 'dava-coins-update',
      orderId: undefined,
      usageType: 'credit',
      coins: Number(amount),
      description: `${amount} dava coins credited by admin`,
      createdAt: new Date().toISOString()
    }

    await creditDavaCoinsToUser(newRecord)

    setCoinRecords(prev => [newRecord, ...prev])
    setLocalDavaCoinBalance(b => b + Number(amount))
    setAmount('')
    setOpen(false)
  }

  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Customers', href: '/customers' },
            {
              page: user?.name ?? '-'
            }
          ]}
        />
      </div>

      <div className='mx-auto space-y-6 p-4'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <div className='text-lg font-semibold'>User details</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <div className='text-muted-foreground text-sm'>Name</div>
                <div className='font-medium'>{user?.name ?? '-'}</div>
              </div>

              <div>
                <div className='text-muted-foreground text-sm'>Email</div>
                <div className='font-medium'>{user?.email ?? '-'}</div>
              </div>

              <div>
                <div className='text-muted-foreground text-sm'>Phone</div>
                <div className='font-medium'>{user?.phoneNumber ?? '-'}</div>
              </div>

              <div>
                <div className='text-muted-foreground text-sm'>Verified</div>
                <div className='font-medium'>
                  {user?.accountVerified ? 'Yes' : 'No'}
                </div>
              </div>

              <div>
                <div className='text-muted-foreground text-sm'>
                  Date of birth
                </div>
                <div className='font-medium'>
                  {user?.dateOfBirth ? formatDate(user.dateOfBirth) : '-'}
                </div>
              </div>

              <div>
                <div className='text-muted-foreground text-sm'>Gender</div>
                <div className='font-medium'>{user?.gender ?? '-'}</div>
              </div>

              <div>
                <div className='text-muted-foreground text-sm'>Created at</div>
                <div className='font-medium'>{formatDate(user?.createdAt)}</div>
              </div>

              <div>
                <div className='text-muted-foreground text-sm'>
                  Last updated
                </div>
                <div className='font-medium'>{formatDate(user?.updatedAt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <CoinsIcon size={18} />
                <CardTitle>Dava coins</CardTitle>
              </div>
              <div className='flex items-center gap-10'>
                <div className='flex items-center gap-1 text-right'>
                  <div className='text-muted-foreground text-sm'>Balance: </div>
                  <div className='text-2xl font-semibold'>{localBalance}</div>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant='outline' size='sm' className='ml-2'>
                      <Plus size={14} /> Add coins
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                      <DialogTitle>Add coins to user</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-2 py-2'>
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type='number'
                          placeholder='Enter coins to add'
                          value={amount as any}
                          onChange={e =>
                            setAmount(
                              e.target.value === ''
                                ? ''
                                : Number(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div>
                        <Label>Description (optional)</Label>
                        <Input
                          value={coinAddNote as any}
                          onChange={e => setCoinAddNote(e.target.value ?? '')}
                          placeholder='e.g. credited by admin'
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant='ghost' onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddCoins}
                        disabled={isAdding || !amount}
                      >
                        {isAdding ? 'Adding...' : 'Add coins'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Coins</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coinRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className='py-6 text-center'>
                        No coin history
                      </TableCell>
                    </TableRow>
                  )}

                  {coinRecords.map(r => (
                    <TableRow key={r.createdAt}>
                      <TableCell>{formatDate(r.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.usageType === 'credit'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {r.usageType}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.coins}</TableCell>
                      <TableCell className='max-w-md truncate'>
                        {r.description}
                      </TableCell>
                      <TableCell>{r.orderId ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
