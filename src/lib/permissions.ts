import { useSession } from 'next-auth/react'

export const hasPermission = (
  moduleKey: string,
  permissionKey: string
): boolean => {
  const session: any = useSession()

  if (!session || !session.data || !session.data.user) {
    return false
  }

  const { user } = session.data

  if (!user.role || user.role !== 'super-admin') return true

  if (user.permissions?.fullAccess) {
    // Check if full access is enabled
    return true
  }

  // Find the module by key
  const moduleData = user.permissions?.modules?.find(
    (mod: any) => mod.key === moduleKey
  )

  if (!moduleData) {
    return false
  }

  // Check if the required permission exists in the module
  const hasRequiredPermission = moduleData.permissions?.some(
    (perm: any) => perm.key === permissionKey
  )

  return hasRequiredPermission || false
}
