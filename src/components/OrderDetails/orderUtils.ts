export function calculateTaxes(orderItem: any) {
  const { components } = orderItem?.gstDetails ?? {}
  return (components ?? []).map((tax: any) => ({
    name: tax.name,
    rate: tax.rate,
    amount: tax.totalAmount
  }))
}

export function getProductStatus(product: any, lastTimelineStatus: string) {
  const {
    isReturnRequested,
    returnTracking,
    isCancelRequested,
    cancelTracking
  } = product ?? {}

  const findProduct = (items: Array<any>) =>
    items?.find((item: any) => item?._id === product?._id)

  if (isReturnRequested) {
    const itemExists = findProduct(returnTracking?.items)
    if (itemExists) {
      const lastStatus =
        returnTracking?.timeline[returnTracking?.timeline?.length - 1]
      return lastStatus?.label
    }
  }

  if (isCancelRequested) {
    const itemExists = findProduct(cancelTracking?.items)
    if (itemExists) {
      const lastStatus =
        cancelTracking?.timeline[cancelTracking?.timeline?.length - 1]
      return lastStatus?.label
    }
  }

  return lastTimelineStatus == 'logistics_cancelled'
    ? 'Re-book'
    : lastTimelineStatus?.replaceAll('_', ' ')
}

export const getBreadCrumbPathFactory =
  ({
    isStoreAdmin,
    page,
    limit,
    pharmacist,
    order,
    selectedProduct,
    setSelectedStoreTracking,
    setSelectedProduct
  }: any) =>
  () => {
    const ordersPath = isStoreAdmin ? `/store/orders` : `/orders`
    const path: any = [
      {
        page: 'Orders',
        href: `${ordersPath}?page=${page || 0}&limit=${limit || 0}&pharmacist=${pharmacist}`
      },
      {
        page: `Order Id: ${order?.orderId}`,
        href: `${ordersPath}/${order?._id}?page=${page || 0}&limit=${limit || 0}&pharmacist=${pharmacist}`,
        onClickPath: () => {
          setSelectedStoreTracking(null)
          setSelectedProduct(null)
        }
      }
    ]
    if (selectedProduct) path.push({ page: selectedProduct?.product?.title })
    return path
  }
