import { useMutation } from '@tanstack/react-query'
import {
  handleAcceptPrescription,
  handleRejectPrescription,
  handleStoreOrderPrescriptionStateChange,
  ticketPrescription
} from '../actions/prescriptionStatus'

export const useRejectPrescription = () => {
  return useMutation({
    mutationFn: handleRejectPrescription
  })
}

export const useAcceptPrescription = () => {
  return useMutation({
    mutationFn: handleAcceptPrescription
  })
}

export const useChangeStoreOrderPrescriptionStatus = () => {
  return useMutation({
    mutationFn: handleStoreOrderPrescriptionStateChange
  })
}

export const useTicketPrescriptionStatus = () => {
  return useMutation({
    mutationFn: ticketPrescription
  })
}
