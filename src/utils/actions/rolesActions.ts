import api from '@/lib/axios'

export async function createRole(formData: any) {
  try {
    const axiosRes = await api.post('/roles', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function fetchRoles(query: any) {
  try {
    console.log('roles query====== ', query)
    const reqQuery: any = query?.noPagination
      ? { noPagination: true }
      : {
          $limit: query?.$limit || 10,
          $skip: query?.$skip || 0
        }

    if (query?.filters) {
      for (const filter of query?.filters) {
        if (filter.id === 'roleName') {
          reqQuery.roleName = {
            $regex: filter.value,
            $options: 'i'
          }
        }
      }
    }

    console.log('roles query======= ', query, reqQuery)
    const axiosRes = await api.get('/roles', {
      params: reqQuery
    })

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function fetchModules() {
  try {
    const axiosRes = await api.get('/modules')
    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function fetchRoleById(roleId: string) {
  if (roleId === 'new') return null
  try {
    const axiosRes = await api.get(`/roles/${roleId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updateRole(formData: any) {
  try {
    const { _id, ...data } = formData

    const axiosRes = await api.patch(`/roles/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function deleteRole(roleId: string) {
  try {
    const axiosRes = await api.delete(`/roles/${roleId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
