'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Typography, Button } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { api } from '@/lib/api'

type Me = { id: string; email: string; firstName: string; lastName: string }

export default function UserBar() {
  const router = useRouter()

  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    api.get('/auth/me').then(setMe).catch(() => {})
  }, [])

  const name = me ? [me.firstName, me.lastName].filter(Boolean).join(' ') || me.email : ''

  const logout = async () => {
    await api.post('/auth/logout', {})
    router.push('/auth')
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '10px 24px',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <UserOutlined style={{ color: '#999' }} />
        <Typography.Text strong>{name}</Typography.Text>
      </div>

      <Button onClick={logout}>Выйти</Button>
    </div>
  )
}
