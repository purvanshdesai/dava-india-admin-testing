import { useMutation } from '@tanstack/react-query'
import {
  updateTrackOrderTimeLine,
  syncOrderTimeline
} from '../actions/trackOrder'

export const useTrackOrderTimeLine = () => {
  return useMutation({
    mutationFn: updateTrackOrderTimeLine
  })
}

export const useSyncOrderTimeLine = () => {
  return useMutation({
    mutationFn: syncOrderTimeline
  })
}
