'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Divider, Form, Input, InputNumber, message, Row, Select, Space } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';

export default function NewTransactionPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [sources, setSources] = useState([
        { label: 'Combank CC', value: 'Combank CC' },
        { label: 'Cash', value: 'Cash' },
        { label: 'DFCC CC', value: 'DFCC CC' },
        { label: 'DFCC IOC', value: 'DFCC IOC' },
        { label: 'HNB CC', value: 'HNB CC' },
        { label: 'Pan Asia CC', value: 'Pan Asia CC' },
        { label: 'NDB CC', value: 'NDB CC' },
    ]);
    const [newSourceName, setNewSourceName] = useState('');
    const inputRef = React.useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/categories');
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error:', error);
                message.error('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const onFinish = async (values: {
        amount: number;
        category_id: string;
        datetime: dayjs.Dayjs;
        source: string;
        description?: string
    }) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                datetime: values.datetime.format('YYYY-MM-DD HH:mm:ss')
            };

            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to add transaction');

            message.success('Transaction added successfully');
            router.push('/transactions');
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to add transaction');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card variant="borderless" style={{ maxWidth: 800, margin: '0 auto' }}>


            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ datetime: dayjs() }}
                disabled={loading}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="amount"
                            label="Amount"
                            rules={[{ required: true, message: 'Please enter transaction amount' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                precision={2}
                                prefix="LKR"
                                placeholder="0.00"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="category_id"
                            label="Category"
                            rules={[{ required: true, message: 'Please select a category' }]}
                        >
                            <Select
                                showSearch={{
                                    filterOption: (input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                }}
                                placeholder="Select category"
                                loading={loading}
                                options={categories.map(cat => ({
                                    label: cat.category,
                                    value: cat.category_id
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="datetime"
                            label="Date & Time"
                            rules={[{ required: true, message: 'Please select date and time' }]}
                        >
                            <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="source"
                            label="Source"
                            rules={[{ required: true, message: 'Please select payment source' }]}
                        >
                            <Select
                                showSearch={{
                                    filterOption: (input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                }}
                                placeholder="Select source"
                                options={sources}
                                popupRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Space style={{ padding: '0 8px 4px' }}>
                                            <Input
                                                placeholder="New Source"
                                                ref={inputRef}
                                                value={newSourceName}
                                                onChange={(e) => setNewSourceName(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={() => {
                                                    if (newSourceName && !sources.find(s => s.value === newSourceName)) {
                                                        const newSource = { label: newSourceName, value: newSourceName };
                                                        setSources([...sources, newSource]);
                                                        setNewSourceName('');
                                                        setTimeout(() => {
                                                            inputRef.current?.focus();
                                                        }, 0);
                                                    }
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </Space>
                                    </>
                                )}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={4} placeholder="Details about this transaction..." />
                </Form.Item>

                <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: 'right' }}>
                    <Space>
                        <Button onClick={() => router.push('/transactions')}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            icon={<SaveOutlined />}
                        >
                            Save Transaction
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
}
