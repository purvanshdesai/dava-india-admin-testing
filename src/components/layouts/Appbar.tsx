import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { handleSignOut } from '@/utils/actions/authActions'
import { ThemeSwitcher } from '../utils/theme-switcher'
import { useSession } from 'next-auth/react'
import { LogOut, Menu } from 'lucide-react'

export default function Appbar({
  isMini,
  setMiniStatus
}: {
  isMini: boolean
  setMiniStatus: any
}) {
  const { data: session, status: sessionStatus } = useSession()
  return (
    <div>
      <div className={`flex items-center justify-between p-3`}>
        <div>
          <Menu
            className='cursor-pointer'
            onClick={() => setMiniStatus(!isMini)}
          />
        </div>

        <div className='flex items-center gap-5'>
          <div>
            <ThemeSwitcher />
          </div>

          <div className='flex items-center gap-2'>
            <Avatar>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <span className='text-sm font-medium'>
              {sessionStatus && session?.user?.email}
            </span>
          </div>

          <LogOut
            className='cursor-pointer text-red-600'
            onClick={async () => await handleSignOut()}
          />
        </div>
      </div>
    </div>
  )
}
