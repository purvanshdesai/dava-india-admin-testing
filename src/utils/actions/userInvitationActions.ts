import api from '@/lib/axios'

const baseUrl = '/user-invitations'

interface InvitationParams {
  invitationToken: string
}
export async function CreateInvitation(formData: any) {
  try {
    const axiosRes = await api.post(baseUrl, formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function ValidateInvitation(params: InvitationParams) {
  try {
    const response = await api.get(
      `/store-admin/invitations?invitationToken=${params.invitationToken}`
    )

    return response.data
  } catch (error) {
    console.log(error)
  }
}

export async function AcceptOrRejectInvitation(formData: any) {
  try {
    const { _id, ...data } = formData

    const axiosRes = await api.patch(`/store-admin/invitations/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function fetchUserInvitations(query: any) {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip
    }

    const res = await api.get('/super-admin-users/invitations', {
      params: reqQuery
    })

    return res.data
  } catch (error) {
    throw error
  }
}

export async function deleteUserInvitation({
  invitationId
}: {
  invitationId: string
}) {
  try {
    const axiosRes = await api.delete(`/user-invitations/${invitationId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
