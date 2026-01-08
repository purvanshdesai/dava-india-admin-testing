import { useMutation, useQuery } from '@tanstack/react-query'
import {
  chatGptTranslation,
  handleGetLanguage,
  handleGetLanguages,
  handlePatchLanguage
} from '../actions/languageActions'

export const useGetLanguages = (query: any) => {
  return useQuery({
    queryFn: () => handleGetLanguages(query),
    queryKey: ['find-language', query]
  })
}

export const useGetLanguage = (id: string) => {
  return useQuery({
    queryFn: () => handleGetLanguage(id),
    queryKey: ['find-language', id]
  })
}

export const usePatchLanguage = () => {
  return useMutation({
    mutationFn: handlePatchLanguage
  })
}

export const useGetGptTranslation = () => {
  return useMutation({
    mutationFn: chatGptTranslation
  })
}
