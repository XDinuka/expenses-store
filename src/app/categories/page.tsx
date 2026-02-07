'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Category } from '@/types';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

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

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (values: { category: string }) => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (response.status === 409) {
                message.warning('Category already exists');
                return;
            }

            if (!response.ok) throw new Error('Failed to add category');

            message.success('Category added successfully');
            form.resetFields();
            setIsModalVisible(false);
            fetchCategories();
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to add category');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'category_id',
            key: 'category_id',
            width: 100,
        },
        {
            title: 'Category Name',
            dataIndex: 'category',
            key: 'category',
        },
    ];

    return (
        <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                >
                    Add Category
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={categories}
                rowKey="category_id"
                loading={loading}
            />

            <Modal
                title="Add New Category"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddCategory}
                >
                    <Form.Item
                        name="category"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input placeholder="e.g. Food, Transport, Rent" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Add
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}
