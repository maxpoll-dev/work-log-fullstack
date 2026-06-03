import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UserBar from './user-bar'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  if (!cookieStore.get('auth.sid')) redirect('/auth')

  return (
    <>
      <UserBar />
      {children}
    </>
  )
}
