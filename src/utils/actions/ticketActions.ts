import api from '@/lib/axios'

export async function fetchTickets(query: any = {}) {
  try {
    const reqQuery: any = {
      limit: query.$limit || 10, // Default limit to 10 if undefined
      skip: query.$skip || 0 // Default skip to 0 if undefined
    }

    // Add date range filters
    if (query.dateRange) {
      reqQuery.dateRange = query.dateRange
    }
    if (query.dateFilterType) {
      reqQuery.dateFilterType = query.dateFilterType
    }

    if (query.filters) {
      for (const filter of query.filters) {
        if (filter.id == 'ticketId') {
          reqQuery['search'] = filter.value
        }
        if (filter.id === 'status') {
          reqQuery['statusFilter'] = filter.value
        }
        if (filter.id === 'createdBy') {
          reqQuery['issueFilter'] = filter.value
        }
      }
    }

    const axiosRes = await api.get('/support/tickets', {
      params: reqQuery
    })

    return axiosRes?.data
  } catch (e) {
    console.error('Error fetching tickets:', e)
    throw e
  }
}

export async function fetchTicketDetails(ticketId: string) {
  try {
    const axiosRes = await api.get(`/support/tickets/${ticketId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updateTicket(ticketData: any) {
  try {
    const { _id, ...data } = ticketData
    const axiosRes = await api.patch(`/support/tickets/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function addActivity(data: any) {
  const { ticketId, ...activity } = data
  try {
    const axiosRes = await api.post(
      `/support/tickets/${ticketId}/activities`,
      activity
    )

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function fetchAssignee(ticketId: string) {
  try {
    const axiosRes = await api.get(`/support/tickets/${ticketId}/assignee`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function setAssignee({
  ticketId,
  assignee
}: {
  ticketId: string
  assignee: string
}) {
  try {
    const axiosRes = await api.patch(
      `/support/tickets/${ticketId}/assignee/${ticketId}`,
      {
        assignee
      }
    )

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
