'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Form, Input, InputNumber, message, Select, Space, Typography } from 'antd'
import { api } from '@/lib/api'
import { Option } from '@/lib/types'

type FormValues = { typeId: string; unitId: string; amount: number; comment?: string }

export default function NewEntryPage() {
  const router = useRouter()

  const [types, setTypes] = useState<Option[]>([])
  const [units, setUnits] = useState<Option[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/work-types'), api.get('/work-units')])
      .then(([t, u]) => {
        setTypes(t)
        setUnits(u)
      })
      .catch((e) => message.error((e as Error).message))
  }, [])

  async function onFinish(values: FormValues) {
    setSaving(true)
    try {
      await api.post('/journal', values)

      message.success('Запись добавлена')
      router.push('/')
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <Typography.Title level={3}>Новая запись</Typography.Title>
      <Card>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="typeId" label="Вид работ" rules={[{ required: true, message: 'Выберите вид работ' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Выберите вид работ"
              options={types.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Form.Item>

          <Form.Item name="unitId" label="Единица измерения" rules={[{ required: true, message: 'Выберите единицу' }]}>
            <Select placeholder="Выберите единицу" options={units.map((u) => ({ value: u.id, label: u.name }))} />
          </Form.Item>

          <Form.Item name="amount" label="Объём" rules={[{ required: true, message: 'Укажите объём' }]}>
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea rows={3} maxLength={2000} />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>Сохранить</Button>

            <Button onClick={() => router.push('/')}>Отмена</Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}
