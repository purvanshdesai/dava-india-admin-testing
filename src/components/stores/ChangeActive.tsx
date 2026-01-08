'use client'
import React from 'react'
import { Switch } from '../ui/switch'

export default function ChangeActive({
  active = false,
  disabled,
  onStatusChange
}: {
  active: boolean
  disabled: boolean
  onStatusChange: (status: boolean) => void
}) {
  const handleSwitchChange = async (status: boolean) => {
    try {
      onStatusChange(status)
    } catch (error) {
      throw error
    }
  }

  return (
    <Switch
      checked={active}
      disabled={disabled}
      onCheckedChange={handleSwitchChange}
    />
  )
}
