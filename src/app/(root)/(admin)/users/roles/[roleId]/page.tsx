import React, { ReactElement } from 'react'
import RolesForm from '@/components/roles/RoleForm'

type Props = {
  params: Promise<{ roleId: string }>
}

export default async function RoleFormPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { roleId } = await params

  return (
    <div>
      <RolesForm params={{ roleId }} />
    </div>
  )
}
