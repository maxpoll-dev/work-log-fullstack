'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd'
import { api } from '@/lib/api'
import { JournalEntry, Option } from '@/lib/types'

type FormValues = { typeId: string; unitId: string; amount: number; comment?: string }

export default function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [form] = Form.useForm<FormValues>()
  const [types, setTypes] = useState<Option[]>([])
  const [units, setUnits] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/work-types'), api.get('/work-units'), api.get(`/journal/${id}`)])
      .then(([t, u, entry]: [Option[], Option[], JournalEntry]) => {
        setTypes(t)
        setUnits(u)
        form.setFieldsValue({
          typeId: entry.typeId,
          unitId: entry.unitId,
          amount: Number(entry.amount),
          comment: entry.comment ?? undefined,
        })
      })
      .catch((e) => message.error((e as Error).message))
      .finally(() => setLoading(false))
  }, [id, form])

  async function onFinish(values: FormValues) {
    setSaving(true)
    try {
      await api.patch(`/journal/${id}`, values)
      message.success('Сохранено')

      router.push('/')
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    try {
      await api.del(`/journal/${id}`)

      message.success('Запись удалена')
      router.push('/')
    } catch (e) {
      message.error((e as Error).message)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <Typography.Title level={3}>Редактирование записи</Typography.Title>
      <Card>
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="typeId" label="Вид работ" rules={[{ required: true, message: 'Выберите вид работ' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                options={types.map((t) => ({ value: t.id, label: t.name }))}
              />
            </Form.Item>

            <Form.Item name="unitId" label="Единица измерения" rules={[{ required: true, message: 'Выберите единицу' }]}>
              <Select options={units.map((u) => ({ value: u.id, label: u.name }))} />
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

              <Popconfirm title="Удалить запись?" okText="Удалить" cancelText="Отмена" onConfirm={onDelete}>
                <Button danger>Удалить</Button>
              </Popconfirm>
            </Space>
          </Form>
        </Spin>
      </Card>
    </div>
  )
}
