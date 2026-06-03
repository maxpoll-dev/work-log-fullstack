'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, DatePicker, message, Select, Table, Typography } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { api } from '@/lib/api'
import { JournalEntry, JournalList, JournalUser, userName } from '@/lib/types'

import type { ColumnsType } from 'antd/es/table'
import type { SorterResult, TablePaginationConfig } from 'antd/es/table/interface'

const { RangePicker } = DatePicker

export default function HomePage() {
  const router = useRouter()

  const [data, setData] = useState<JournalList | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState<string | undefined>()
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [users, setUsers] = useState<JournalUser[]>([])

  useEffect(() => {
    let active = true

    const params = new URLSearchParams({ page: String(page), order })

    if (userId) params.set('userId', userId)

    if (range) {
      params.set('from', range[0].startOf('day').toISOString())
      params.set('to', range[1].endOf('day').toISOString())
    }

    const load = async () => {
      setLoading(true)

      try {
        const res: JournalList = await api.get('/journal?' + params.toString())
        if (!active) return

        setData(res)
        setUsers((prev) => {
          const map = new Map(prev.map((u) => [u.id, u]))

          for (const item of res.items) map.set(item.user.id, item.user)

          return [...map.values()]
        })
      } catch (e) {
        if (active) message.error((e as Error).message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [page, userId, range, order])

  const columns: ColumnsType<JournalEntry> = [
    { title: 'Сотрудник', dataIndex: 'user', render: (u: JournalUser) => userName(u) },

    { title: 'Вид работ', dataIndex: ['workType', 'name'] },

    {
      title: 'Объём',
      dataIndex: 'amount',
      render: (v: string, row) => `${Number(v)} ${row.unitType.name}`,
    },

    { title: 'Комментарий', dataIndex: 'comment', ellipsis: true },

    {
      title: 'Дата',
      dataIndex: 'createdAt',
      sorter: true,
      sortOrder: order === 'asc' ? 'ascend' : 'descend',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
    },
  ]

  function onTableChange(
    _p: TablePaginationConfig,
    _f: unknown,
    sorter: SorterResult<JournalEntry> | SorterResult<JournalEntry>[],
  ) {
    const s = Array.isArray(sorter) ? sorter[0] : sorter
    setOrder((prev) =>
      s?.order === 'ascend' ? 'asc' : s?.order === 'descend' ? 'desc' : prev === 'asc' ? 'desc' : 'asc',
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Журнал работ</Typography.Title>

        <Button type="primary" onClick={() => router.push('/journal/new')}>
          Добавить запись
        </Button>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <RangePicker
            value={range}
            format="DD.MM.YYYY"
            onChange={(v) => {
              setRange(v as [Dayjs, Dayjs] | null)
              setPage(1)
            }}
          />
          <Select
            allowClear
            placeholder="Сотрудник"
            style={{ minWidth: 220 }}
            value={userId}
            onChange={(v) => {
              setUserId(v)
              setPage(1)
            }}
            options={users.map((u) => ({ value: u.id, label: userName(u) }))}
          />
        </div>
      </Card>

      <Table<JournalEntry>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data?.items ?? []}
        onChange={onTableChange}
        onRow={(row) => ({
          onClick: () => router.push(`/journal/${row.id}`),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: page,
          pageSize: data?.limit ?? 20,
          total: data?.total ?? 0,
          showSizeChanger: false,
          onChange: setPage,
        }}
      />
    </div>
  )
}
