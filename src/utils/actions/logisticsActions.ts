'use client'
import api from '@/lib/axios'

export async function fetchLogisticsRules(requestData: {
  skip: number
  limit: number
  filters?: { id: string; value: string }[]
}) {
  try {
    const API_URL = '/logistics'

    const { skip, limit, filters = [] } = requestData

    const requestQuery: any = {
      skip,
      limit
    }
    for (const filter of filters) {
      if (filter.id === 'ruleName') requestQuery.search = filter.value
    }

    const resp = await api.get(API_URL, { params: requestQuery })
    return resp.data
  } catch (err) {
    console.log('error while getting logistics rules', err)
    throw err
  }
}

export async function fetchLogisticsRuleById(ruleId: string) {
  try {
    if (ruleId === 'new') return
    const API_URL = '/logistics'
    const resp = await api.get(`${API_URL}/${ruleId}`)
    return resp.data
  } catch (err) {
    console.log('error while getting logistics rules', err)
    throw err
  }
}

export async function addNewLogisticsRule({ ruleName }: { ruleName: string }) {
  try {
    const API_URL = `/logistics`

    const resp = await api.post(API_URL, { ruleName })
    return resp.data
  } catch (err) {
    console.log('Error while while crating new logistics rule ', err)
    throw err
  }
}

export async function deleteLogisticsRule(id: string) {
  try {
    const API_URL = '/logistics'

    const resp = await api.delete(`${API_URL}/${id}`)
    return resp.data
  } catch (err) {
    console.log('Error while deleting logistics rule', err)
    throw err
  }
}

export async function fetchLogisticsRuleDeliveryZones(requestData: {
  ruleId: string
  skip: number
  limit: number
  filters?: { id: string; value: string }[]
}) {
  try {
    const { ruleId, skip, limit } = requestData

    if (ruleId === 'new') return

    const API_URL = `/logistics/${ruleId}/delivery-zones`

    const requestQuery: any = {
      skip,
      limit
    }
    // for (const filter of filters) {
    //   if (filter.id === 'ruleName') requestQuery.search = filter.value
    // }

    const resp = await api.get(API_URL, { params: requestQuery })
    return resp.data
  } catch (err) {
    console.log('error while getting logistics rules', err)
    throw err
  }
}

export async function deleteLogisticsRuleDeliveryZone({
  ruleId,
  deliveryPolicyId
}: {
  ruleId: string
  deliveryPolicyId: string
}) {
  try {
    const API_URL = `/logistics/${ruleId}/delivery-zones/${deliveryPolicyId}`

    const resp = await api.delete(API_URL)
    return resp.data
  } catch (err) {
    console.log('Error while deleting logistics rule delivery zone', err)
    throw err
  }
}

export async function fetchLogisticsRuleCouriers(requestData: {
  ruleId: string
  skip: number
  limit: number
  filters?: { id: string; value: string }[]
}) {
  try {
    const { ruleId, skip, limit } = requestData

    if (ruleId === 'new') return

    const API_URL = `/logistics/${ruleId}/couriers`

    const requestQuery: any = {
      skip,
      limit
    }
    // for (const filter of filters) {
    //   if (filter.id === 'ruleName') requestQuery.search = filter.value
    // }

    const resp = await api.get(API_URL, { params: requestQuery })
    return resp.data
  } catch (err) {
    console.log('error while getting logistics rules', err)
    throw err
  }
}

export async function deleteLogisticsRuleCourier({
  ruleId,
  partner,
  partnerCourierId
}: {
  ruleId: string
  partner: string
  partnerCourierId: string
}) {
  try {
    const API_URL = `/logistics/${ruleId}/couriers/${partnerCourierId}?partner=${partner}`

    const resp = await api.delete(API_URL)
    return resp.data
  } catch (err) {
    console.log('Error while deleting logistics rule courier', err)
    throw err
  }
}

export async function addDeliveryZonesToLogisticsRule({
  ruleId,
  deliveryPolicyId
}: {
  ruleId: string
  deliveryPolicyId: string[]
}) {
  try {
    const API_URL = `/logistics/${ruleId}/delivery-zones`

    const resp = await api.post(API_URL, { deliveryPolicyId })
    return resp.data
  } catch (err) {
    console.log('Error while deleting logistics rule delivery zone', err)
    throw err
  }
}

export async function fetchAllCourierPartners(query: any) {
  try {
    if (!query) return []
    const API_URL = `/logistics/courier-partners`

    const resp = await api.get(API_URL, { params: query })
    return resp.data
  } catch (err) {
    console.log('Error while fetching courier partners', err)
    throw err
  }
}

export async function addCouriersToLogisticsRule({
  ruleId,
  couriers,
  packageSize
}: {
  ruleId: string
  couriers: any[]
  packageSize: 'small' | 'big'
}) {
  try {
    const API_URL = `/logistics/${ruleId}/couriers`

    const resp = await api.post(API_URL, { couriers, packageSize })
    return resp.data
  } catch (err) {
    console.log('Error while deleting logistics rule delivery zone', err)
    throw err
  }
}
