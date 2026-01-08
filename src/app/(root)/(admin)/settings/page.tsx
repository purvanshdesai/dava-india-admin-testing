// settings-page.tsx
import React from 'react'
import Link from 'next/link'
import {
  DeliveryManagement,
  GeneralSettings,
  LanguageTranslation,
  ZipCodeManagement
} from '@/components/icons/icon'
import { Waypoints, FileText, BriefcaseMedicalIcon } from 'lucide-react'

type IconComponent = React.ElementType
type IconProps = Record<string, unknown>

type CardItem = {
  href: string
  title: string
  Icon: IconComponent
  iconProps?: IconProps
  description?: string
}

const CARD_BASE_CLASSES =
  'flex h-[180px]  items-center justify-center rounded-xl border hover:shadow-lg dark:border-gray-600'

const InnerClasses = 'flex flex-col items-center gap-4 text-sm'

const SettingsCard: React.FC<CardItem> = ({ href, title, Icon, iconProps }) => {
  return (
    <Link href={href} aria-label={title}>
      <li className={CARD_BASE_CLASSES} role='listitem'>
        <div className={InnerClasses}>
          <Icon {...(iconProps as any)} />
          <p>{title}</p>
        </div>
      </li>
    </Link>
  )
}

const cards: CardItem[] = [
  {
    href: '/settings/generalSettings',
    title: 'General Settings',
    Icon: GeneralSettings
  },
  {
    href: '/settings/language',
    title: 'Languages Translations',
    Icon: LanguageTranslation
  },
  {
    href: '/settings/zipCodes',
    title: 'Zip Code Management',
    Icon: ZipCodeManagement
  },
  {
    href: '/settings/deliveryPolicy',
    title: 'Delivery Management',
    Icon: DeliveryManagement
  },
  {
    href: '/settings/navigations',
    title: 'Category Navigation',
    Icon: Waypoints,
    iconProps: { size: 90, className: 'text-primary', strokeWidth: '1.25px' }
  },
  {
    href: '/settings/policies',
    title: 'Policies',
    Icon: FileText,
    iconProps: { size: 90, className: 'text-primary', strokeWidth: '1.25px' }
  },
  {
    href: '/settings/medicine-requests',
    title: 'Medicine Requests',
    Icon: BriefcaseMedicalIcon,
    iconProps: { size: 90, className: 'text-primary', strokeWidth: '1.25px' }
  }
]

const SettingsPage: React.FC = () => {
  return (
    <div>
      <h1 className='mb-2 text-2xl font-semibold'>Settings</h1>

      <ul className='grid grid-cols-5 gap-4 pt-6' role='list'>
        {cards.map(c => (
          <SettingsCard key={c.href} {...c} />
        ))}
      </ul>
    </div>
  )
}

export default SettingsPage
