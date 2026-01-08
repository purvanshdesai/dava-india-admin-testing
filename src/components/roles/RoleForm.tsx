'use client'
import AppBreadcrumb from '@/components/Breadcrumb'
import FormInputField from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { rolesSchema } from '@/lib/zod'
import { createRole, updateRole } from '@/utils/actions/rolesActions'
import { useFetchModules, useFetchRoleById } from '@/utils/hooks/rolesHook'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

export default function RolesForm({ params }: { params: { roleId: string } }) {
  const router = useRouter()
  const roleId = params.roleId

  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  // group by key
  const groupModulesByKey = (modules: any) => {
    return modules.reduce((acc: any, module: any) => {
      const existingModule = acc.find((m: any) => m.key === module.key)

      if (existingModule) {
        existingModule.sections.push({
          sectionName: module.sectionName,
          description: module.description,
          permissions: module.permissions,
          _id: module._id
        })
      } else {
        acc.push({
          ...module,
          sections: [
            {
              sectionName: module.sectionName,
              description: module.description,
              permissions: module.permissions,
              _id: module._id
            }
          ]
        })
      }
      return acc
    }, [])
  }

  const [load, setLoad] = useState(false)
  const { data: modules } = useFetchModules()

  const [groupedModules, setGroupedModules] = useState([])

  useEffect(() => {
    if (modules) {
      const grouped = groupModulesByKey(modules)
      setGroupedModules(grouped)
    }
  }, [modules])

  const { data: role } = useFetchRoleById(roleId)
  const [moduleStates, setModuleStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [selectedPermissions, setSelectedPermissions] = useState<{
    [key: string]: string[]
  }>({})

  // Assuming you have a role state. Uncomment and initialize as needed
  // const [role, setRole] = useState<{ modules: { moduleId: string, permissions: string[] }[] }>({ modules: [] });

  const form = useForm<z.infer<typeof rolesSchema>>({
    resolver: zodResolver(rolesSchema),
    defaultValues: { roleName: '', fullAccess: false }
  })

  useEffect(() => {
    if (role) {
      // Reset form with role data
      form.reset({
        roleName: role.roleName || '',
        fullAccess: role.fullAccess ?? false
      })

      const modulesState: { [key: string]: boolean } = {}
      const permissionsState: { [key: string]: string[] } = {}

      role.modules.forEach((module: any) => {
        modulesState[module.moduleId] = true
        permissionsState[module.moduleId] = module.permissions || []
      })

      setModuleStates(modulesState)
      setSelectedPermissions(permissionsState)
    }
  }, [role, form])

  const isFullAccessSelected = () => {
    const { fullAccess } = form.getValues()

    return fullAccess
  }

  const handleToggle = (moduleId: string) => {
    setModuleStates(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  const handleCheckboxChange = (
    moduleId: string,
    permissionId: string,
    isModuleCheckbox: boolean
  ) => {
    setSelectedPermissions(prev => {
      const currentPermissions = prev[moduleId] || []
      let updatedPermissions: string[]

      if (isModuleCheckbox) {
        updatedPermissions =
          currentPermissions.length > 0
            ? []
            : modules
                .find((m: any) => m._id === moduleId)
                ?.permissions.map((p: any) => p._id) || []
      } else {
        updatedPermissions = currentPermissions.includes(permissionId)
          ? currentPermissions.filter(permId => permId !== permissionId)
          : [...currentPermissions, permissionId]
      }

      return { ...prev, [moduleId]: updatedPermissions }
    })
  }

  const hasPermission = (moduleId: string, permissionId: string) => {
    const currentPermissions = selectedPermissions[moduleId] || []
    return currentPermissions.includes(permissionId)
  }

  const onSubmit = async (data: z.infer<typeof rolesSchema>) => {
    try {
      setLoad(true)
      const { fullAccess } = data
      const hasSelectedPermissions = Object.values(selectedPermissions).some(
        permissions => permissions.length > 0
      )

      if (!fullAccess && !hasSelectedPermissions) {
        // Show an alert or toast if no permissions are selected
        toast({
          title: 'Oops!',
          description:
            'Please select at least one permission or enable full access.'
        })
        return
      }

      const roleData = {
        roleName: data.roleName,
        fullAccess: data.fullAccess,
        active: true,
        modules: Object.keys(moduleStates)
          .map(key => {
            // Remove '-index' if it exists in the module ID
            const moduleId = key.replace(/-\d+$/, '')

            const permissions = moduleStates[key]
              ? modules
                  .find((m: any) => m._id === moduleId)
                  ?.permissions.map((p: any) => p._id) || []
              : []

            return {
              moduleId: moduleId,
              permissions: permissions.filter((permissionId: string) =>
                hasPermission(moduleId, permissionId)
              )
            }
          })
          .filter(mod => mod.permissions.length > 0)
      }

      if (roleId !== 'new') await updateRole({ _id: roleId, ...roleData })
      else await createRole(roleData)
      router.push(
        roleId !== 'new'
          ? `/users/roles?page=${page}&limit=${limit}`
          : '/users/roles'
      )
    } catch (error) {
      console.log(error)
    } finally {
      setLoad(false)
    }
  }

  return (
    <>
      <div className='border-b py-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Roles', href: '/users/roles' },
            {
              page: roleId !== 'new' ? (role?.roleName ?? '') : 'Add New Role'
            }
          ]}
        />
      </div>

      <div className='relative h-full'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <div className='my-4 text-lg font-semibold'>Roles</div>
              <div className='grid grid-cols-2 items-center'>
                <FormInputField
                  formInstance={form as unknown as UseFormReturn}
                  name={'roleName'}
                  label={'Add New Role '}
                  placeholder={'Enter Role Name'}
                  isSmall={true}
                  isReq={true}
                />
                {/* <span className='ml-auto mt-6 text-sm text-primary underline underline-offset-4'>
                Reset to default
              </span> */}
              </div>

              <div className='grid grid-cols-2 py-3'>
                <FormField
                  control={form.control}
                  name='fullAccess'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg py-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base text-black dark:text-gray-300'>
                          Full Access
                        </FormLabel>
                        <FormDescription>
                          Full access users can read, write on all the modules.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div></div>
              </div>

              {!isFullAccessSelected() && (
                <div>
                  <div className='my-4 text-lg font-semibold'>Modules</div>
                  <div>
                    {groupedModules &&
                      groupedModules.map((module: any) => (
                        <div
                          key={module._id}
                          className='mb-6 rounded-lg border bg-primary-light-blue px-4 pb-1 pt-3'
                        >
                          <div className='mb-2 flex items-center justify-between'>
                            <h2 className='text-sm font-semibold'>
                              {module.moduleName}
                            </h2>
                            {module.sections.length === 1 && (
                              <Switch
                                checked={moduleStates[module._id] || false}
                                onCheckedChange={() => handleToggle(module._id)}
                              />
                            )}
                          </div>

                          {module.sections.length > 1 ? (
                            // Always open for multiple sections
                            <div className='bg-white px-2 pb-2 pt-1'>
                              {module.sections.map(
                                (section: any, sectionIdx: number) => (
                                  <div
                                    key={sectionIdx}
                                    className='mt-2 rounded-md bg-primary-light-blue p-3'
                                  >
                                    <div className='mb-2 flex items-center justify-between gap-6'>
                                      <h3 className='text-sm font-medium'>
                                        {section.sectionName}
                                      </h3>
                                      <Switch
                                        checked={
                                          moduleStates[`${section._id}`] ||
                                          false
                                        }
                                        onCheckedChange={() =>
                                          handleToggle(`${section._id}`)
                                        }
                                      />
                                    </div>
                                    {moduleStates[`${section._id}`] && (
                                      <div className='flex flex-wrap items-center gap-10 rounded-md bg-white px-2 py-3'>
                                        {section.permissions.map(
                                          (permission: any) => (
                                            <div
                                              key={permission._id}
                                              className='flex items-center gap-4'
                                            >
                                              <label className='flex items-center space-x-2'>
                                                <Checkbox
                                                  checked={hasPermission(
                                                    section._id,
                                                    permission._id
                                                  )}
                                                  onCheckedChange={() =>
                                                    handleCheckboxChange(
                                                      section._id,
                                                      permission._id,
                                                      false
                                                    )
                                                  }
                                                />
                                                <span className='text-sm'>
                                                  {permission.permissionName}
                                                </span>
                                              </label>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            // Toggle for single section
                            moduleStates[module._id] && (
                              <div className='my-3 flex flex-wrap items-center gap-10 bg-white p-4'>
                                {module.sections[0]?.permissions.map(
                                  (permission: any) => (
                                    <div
                                      key={permission._id}
                                      className='flex items-center gap-4'
                                    >
                                      <label className='flex items-center space-x-2'>
                                        <Checkbox
                                          checked={hasPermission(
                                            module._id,
                                            permission._id
                                          )}
                                          onCheckedChange={() =>
                                            handleCheckboxChange(
                                              module._id,
                                              permission._id,
                                              false
                                            )
                                          }
                                        />
                                        <span className='text-sm'>
                                          {permission.permissionName}
                                        </span>
                                      </label>
                                    </div>
                                  )
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className='sticky bottom-0 left-0 w-full bg-primary-light-blue py-2 pr-3'>
                <div className='flex justify-end gap-[20px]'>
                  <Button
                    onClick={() => router.back()}
                    type='button'
                    className='w-24 border border-orange-500 bg-white text-center text-orange-500'
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    loader={load}
                    className='w-24 text-center'
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
