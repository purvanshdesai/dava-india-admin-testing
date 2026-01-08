export const orderStatusFilters: any = [
  { value: 'pending', label: 'Pending' },
  { value: 'payment-cancelled-by-user', label: 'Payment Cancelled By User' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' }
]

export const orderPaymentMethodFilters: any = [
  { value: 'card', label: 'Card' },
  { value: 'net-banking', label: 'Net Banking' },
  { value: 'upi', label: 'UPI' },
  { value: 'wallet', label: 'Wallet' }
]
export const deliveryModeFilters: any = [
  { value: 'oneDay', label: 'One Day' },
  { value: 'standard', label: 'Standard' }
]

export const davaOneMembershipFilters: any = [
  { value: 'true', label: 'DavaOne Members' },
  { value: 'false', label: 'Non-Members' }
]

export const orderTrackingStatus: any = [
  {
    label: 'Order placed',
    value: 'order_placed'
  },
  {
    label: 'Order confirmed',
    value: 'order_confirmed'
  },
  {
    label: 'Order under verification',
    value: 'order_under_verification'
  },
  {
    label: 'Dispatched',
    value: 'dispatched'
  },
  {
    label: 'Delivered',
    value: 'delivered'
  },
  {
    label: 'Return to origin(RTO) request',
    value: 'return_to_origin'
  },
  {
    label: 'Return approved',
    value: 'return_approved'
  },
  {
    label: 'Return declined',
    value: 'return_declined'
  },
  {
    label: 'Refund Initiated',
    value: 'refund_initiated'
  },
  {
    label: 'Refund Processed',
    value: 'refund_completed'
  },

  {
    label: 'Customer requested to cancel',
    value: 'customer_canceled'
  },
  {
    label: 'Order canceled',
    value: 'canceled'
  },
  {
    label: 'Canceled by Shop',
    value: 'canceled_by_shop'
  },
  {
    label: 'Order transferred to another shop',
    value: 'order_transferred_to_another_shop'
  },
  {
    label: 'Prescription is approved',
    value: 'prescription_approved'
  },
  {
    label: 'Prescription is not valid',
    value: 'prescription_declined'
  },
  {
    label: 'Prescription is not clear',
    value: 'prescription_not_clear'
  },
  {
    label: 'Prescription is not available',
    value: 'prescription_not_available'
  },
  {
    label: 'Admin Attention Required',
    value: 'admin_attention_required'
  },
  {
    label: 'Informational Update',
    value: 'informational_update'
  },
  {
    label: 'Customer raised a concern to change the address',
    value: 'customer_raised_a_concern'
  },
  {
    label: 'Prescription is being generated',
    value: 'prescription_being_generated'
  },
  {
    label: 'Prescription generated',
    value: 'prescription_generated'
  },
  {
    label: 'Shipped',
    value: 'shipped'
  },
  {
    label: 'Cancelled',
    value: 'logistics_cancelled'
  },
  {
    label: 'RTO delivered',
    value: 'rto_delivered'
  },
  {
    label: 'Pickup rescheduled',
    value: 'pickup_rescheduled'
  },
  {
    label: 'Out for delivery',
    value: 'out_for_delivery'
  },
  {
    label: 'In transit',
    value: 'in_transit'
  },
  {
    label: 'Out for pickup',
    value: 'out_for_pickup'
  },
  {
    label: 'Undelivered',
    value: 'undelivered'
  },
  {
    label: 'Delayed',
    value: 'delayed'
  },
  {
    label: 'Fulfilled',
    value: 'fulfilled'
  },
  {
    label: 'Picked up',
    value: 'picked_up'
  },
  {
    label: 'Cancelled before dispatch',
    value: 'cancelled_before_dispatch'
  },
  {
    label: 'RTO in transit',
    value: 'rto_in_transit'
  },
  {
    label: 'QC Failed',
    value: 'qc_failed'
  },
  {
    label: 'Handover to courier',
    value: 'handover_to_courier'
  }
]
