'use client'

import React from "react"
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import '@ant-design/v5-patch-for-react-19'


dayjs.locale('ru')

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider locale={ruRU}>{children}</ConfigProvider>
    </AntdRegistry>
  )
}
