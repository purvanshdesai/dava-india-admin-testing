'use client'

import AppBreadcrumb from '@/components/Breadcrumb'
import { Button } from '@/components/ui/button'
import { createPolicy } from '@/utils/actions/policiesAction'
import { useFetchPolicies } from '@/utils/hooks/policiesHook'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import {
  FileText,
  Save,
  Loader2,
  AlertCircle,
  Lock,
  ShieldAlert,
  Truck,
  RotateCcw,
  Copyright
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type Policy = {
  _id: string
  name?: string
  content?: string
}

const TiptapEditor = dynamic(() => import('@/components/ui/TipTapEditor'), {
  ssr: false
})

export default function PoliciesPage() {
  const { data: policiesRes, isLoading, error } = useFetchPolicies()
  const policies: Policy[] = policiesRes ?? []
  const { toast } = useToast()

  const hasReadPermission = hasPermission(
    MODULES_PERMISSIONS.POLICY_MANAGEMENT.key,
    MODULES_PERMISSIONS.POLICY_MANAGEMENT.permissions.READ_POLICY
  )
  const hasEditPermission = hasPermission(
    MODULES_PERMISSIONS.POLICY_MANAGEMENT.key,
    MODULES_PERMISSIONS.POLICY_MANAGEMENT.permissions.EDIT_POLICY
  )

  const [activePolicyId, setActivePolicyId] = useState<string | null>(null)
  const [contentByPolicy, setContentByPolicy] = useState<
    Record<string, string>
  >({})
  const [originalContentByPolicy, setOriginalContentByPolicy] = useState<
    Record<string, string>
  >({})
  const [isSaving, setIsSaving] = useState(false)

  const fixedTitles = [
    'privacy_policy',
    'terms_and_conditions',
    'grevience_readdressal',
    'shipping_and_delivery_policy',
    'return_refund',
    'ip_policy'
  ]

  const displayTitles = [
    'Privacy Policy',
    'Terms & Conditions',
    'Grievance Redressal',
    'Shipping & Delivery Policy',
    'Return & Refund',
    'IP Policy'
  ]

  const policyIcons = [Lock, FileText, ShieldAlert, Truck, RotateCcw, Copyright]

  const normalize = (html: string) =>
    (html || '').replace(/<p>\s*<\/p>/g, '').replace(/\s+/g, ' ')

  useEffect(() => {
    if (policies.length > 0 && !activePolicyId) {
      setActivePolicyId(policies[0]._id)

      const init: Record<string, string> = {}
      const original: Record<string, string> = {}
      policies.forEach(p => {
        init[p._id] = p.content || ''
        original[p._id] = p.content || ''
      })

      setContentByPolicy(init)
      setOriginalContentByPolicy(original)
    }
  }, [policies, activePolicyId])

  if (!hasReadPermission) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <AlertCircle className='text-destructive h-12 w-12' />
          <div>
            <h3 className='text-lg font-semibold'>Access Denied</h3>
            <p className='text-muted-foreground text-sm'>
              You don't have permission to view policies
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <p className='text-muted-foreground text-sm'>Loading policies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <AlertCircle className='text-destructive h-12 w-12' />
          <div>
            <h3 className='text-lg font-semibold'>Error Loading Policies</h3>
            <p className='text-muted-foreground text-sm'>
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!activePolicyId) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <FileText className='text-muted-foreground h-12 w-12' />
          <div>
            <h3 className='text-lg font-semibold'>No Policies Found</h3>
            <p className='text-muted-foreground text-sm'>
              Create your first policy to get started
            </p>
          </div>
        </div>
      </div>
    )
  }

  const activeContent = contentByPolicy[activePolicyId] ?? ''
  const hasChanges = activePolicyId
    ? normalize(contentByPolicy[activePolicyId]) !==
      normalize(originalContentByPolicy[activePolicyId])
    : false

  const handleChange = (html: string) => {
    if (!activePolicyId) return
    setContentByPolicy(prev => ({ ...prev, [activePolicyId]: html }))
  }

  const handleSave = async () => {
    if (!activePolicyId || !hasChanges) return

    try {
      setIsSaving(true)

      const html = contentByPolicy[activePolicyId]
      const activeIndex = policies.findIndex(p => p._id === activePolicyId)
      const title = fixedTitles[activeIndex] ?? 'untitled'

      await createPolicy({
        content: html,
        name: title
      })

      setOriginalContentByPolicy(prev => ({
        ...prev,
        [activePolicyId]: contentByPolicy[activePolicyId]
      }))

      toast({
        title: 'Success',
        description: 'Policy saved successfully'
      })
    } catch (err) {
      console.error('Error saving policy:', err)
      toast({
        title: 'Error',
        description: 'Failed to save policy',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='h-full'>
      <AppBreadcrumb
        locations={[
          { page: 'Settings', href: '/settings' },
          { page: 'Policies' }
        ]}
      />

      <div className='bg-muted/20 rounded-xl p-4'>
        <div className='grid h-[calc(120vh-260px)] grid-cols-12 gap-4'>
          {/* Sidebar */}
          <div className='bg-card col-span-12 flex h-full flex-col overflow-hidden rounded-lg border shadow-sm md:col-span-3'>
            <div className='bg-muted/50 supports-[backdrop-filter]:bg-muted/40 sticky top-0 z-10 border-b px-4 py-3 backdrop-blur'>
              <h3 className='text-sm font-semibold'>
                Policies ({policies.length})
              </h3>
            </div>
            <ul className='flex-1 space-y-2 overflow-auto p-2'>
              {policies.map((p, index) => {
                const isActive = p._id === activePolicyId
                const Icon = policyIcons[index] || FileText
                return (
                  <li
                    key={p._id}
                    className={`bg-muted/30 hover:bg-muted/60 group relative cursor-pointer rounded-lg border shadow-sm transition-all hover:-translate-y-[1px] ${
                      isActive
                        ? 'border-primary/30 ring-1 ring-primary/30'
                        : 'border-transparent'
                    }`}
                    onClick={() => setActivePolicyId(p._id)}
                  >
                    <div className='flex items-center gap-3 px-3 py-3'>
                      <div
                        className={`rounded-md p-2 ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className='h-4 w-4' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p
                          className={`truncate text-sm ${isActive ? 'text-primary' : ''}`}
                        >
                          {displayTitles[index] ?? p.name ?? 'Untitled Policy'}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Editor */}
          <div className='bg-card col-span-12 flex h-full flex-col overflow-hidden rounded-lg border shadow-sm md:col-span-9'>
            <div className='bg-muted/50 supports-[backdrop-filter]:bg-muted/40 sticky top-0 z-10 border-b px-6 py-3 backdrop-blur'>
              <div className='flex items-center justify-between'>
                <div>
                  {/*<h3 className="font-semibold text-sm">Editor Options</h3>*/}
                  <p className='text-muted-foreground text-xs'>
                    {displayTitles[
                      policies.findIndex(p => p._id === activePolicyId)
                    ] ?? 'Untitled Policy'}
                  </p>
                </div>
              </div>
            </div>

            <div className='flex-1 overflow-auto p-0'>
              <TiptapEditor
                value={activeContent}
                onChange={handleChange}
                editorClassName='min-h-[calc(120vh-420px)]'
                placeholder='Start writing your policy content...'
              />
            </div>

            <div className='bg-muted/30 supports-[backdrop-filter]:bg-muted/20 sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t px-6 py-3 backdrop-blur'>
              {hasEditPermission && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className='gap-2'
                >
                  {isSaving ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4' />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
