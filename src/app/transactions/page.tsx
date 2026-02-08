'use client';

import React, {useEffect, useState} from 'react';
import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography
} from 'antd';
import {EditOutlined, HistoryOutlined, PlusOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import {useRouter} from 'next/navigation';
import {Category, Transaction} from '@/types';

const {Text} = Typography;


export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [reimbModalVisible, setReimbModalVisible] = useState(false);
    const [catModalVisible, setCatModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [reimbForm] = Form.useForm();
    const [catForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [txRes, catRes] = await Promise.all([
                fetch('/api/transactions'),
                fetch('/api/categories')
            ]);

            if (!txRes.ok || !catRes.ok) throw new Error('Failed to fetch data');

            const txData = await txRes.json();
            const catData = await catRes.json();
            setTransactions(txData);
            setCategories(catData);
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handleAddReimbursement = async (values: {
        amount: number;
        datetime: dayjs.Dayjs;
        source?: string;
        description?: string
    }) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                transaction_id: selectedTx?.transaction_id,
                datetime: values.datetime.format('YYYY-MM-DD HH:mm:ss')
            };

            const response = await fetch('/api/reimbursements', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to add reimbursement');

            message.success('Reimbursement added successfully');
            reimbForm.resetFields();
            setReimbModalVisible(false);
            fetchData();
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to add reimbursement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCategorize = async (values: { category_id: number; saveMapping: boolean; bulkUpdate: boolean }) => {
        if (!selectedTx) return;
        setSubmitting(true);
        try {
            // Update transaction
            const txRes = await fetch(`/api/transactions/${selectedTx.transaction_id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    category_id: values.category_id,
                    bulkUpdate: values.bulkUpdate,
                    description: selectedTx.description,
                    old_category_id: selectedTx.category_id
                }),
            });

            if (!txRes.ok) throw new Error('Failed to update transaction');

            // Optionally save mapping
            if (values.saveMapping && selectedTx.description) {
                const categoryName = categories.find(c => c.category_id === values.category_id)?.category;
                if (categoryName) {
                    await fetch('/api/descriptions', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            description: selectedTx.description,
                            category: categoryName
                        }),
                    });
                }
            }

            message.success('Transaction categorized');
            setCatModalVisible(false);
            catForm.resetFields();
            fetchData();
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to categorize transaction');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditTransaction = async (values: any) => {
        if (!selectedTx) return;
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                datetime: values.datetime.format('YYYY-MM-DD HH:mm:ss')
            };

            const response = await fetch(`/api/transactions/${selectedTx.transaction_id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to update transaction');

            message.success('Transaction updated');
            setEditModalVisible(false);
            fetchData();
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to update transaction');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'datetime',
            key: 'datetime',
            render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
            sorter: (a: Transaction, b: Transaction) => dayjs(a.datetime).unix() - dayjs(b.datetime).unix(),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number, record: Transaction) => (
                <span style={{fontWeight: 'bold'}}>
                    {record.currency} {Number(amount).toFixed(2)}
                </span>
            ),
            sorter: (a: Transaction, b: Transaction) => a.amount - b.amount,
        },
        {
            title: 'Reimbursed',
            dataIndex: 'reimbursed_amount',
            key: 'reimbursed_amount',
            render: (amount: number) => (
                <span style={{color: '#52c41a'}}>
                    {amount > 0 ? `LKR${Number(amount).toFixed(2)}` : '-'}
                </span>
            ),
        },
        {
            title: 'Net Amount',
            key: 'net_amount',
            render: (_: unknown, record: Transaction) => {
                const net = record.amount - (record.reimbursed_amount || 0);
                return (
                    <span style={{fontWeight: 'bold', color: net > 0 ? '#f5222d' : '#8c8c8c'}}>
                        {record.currency} {net.toFixed(2)}
                    </span>
                );
            },
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category: string, record: Transaction) => (
                <Tag
                    color={category === 'Uncategorized' ? 'orange' : 'blue'}
                    style={{cursor: 'pointer'}}
                    onClick={() => {
                        setSelectedTx(record);
                        setCatModalVisible(true);
                        catForm.setFieldsValue({
                            category_id: record.category_id,
                            saveMapping: false,
                            bulkUpdate: true
                        });
                    }}
                >
                    {category}
                </Tag>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Transaction) => (
                <Space size="middle">
                    <Tooltip title="Add Reimbursement">
                        <Button
                            type="dashed"
                            icon={<HistoryOutlined/>}
                            size="small"
                            onClick={() => {
                                setSelectedTx(record);
                                setReimbModalVisible(true);
                                reimbForm.setFieldsValue({
                                    amount: record.amount,
                                    description: `Reimbursement for: ${record.description || 'Transaction'}`,
                                    datetime: dayjs(),
                                    source: record.source
                                });
                            }}
                        >
                            Reimb.
                        </Button>
                    </Tooltip>
                    <Button
                        icon={<EditOutlined/>}
                        size="small"
                        onClick={() => {
                            setSelectedTx(record);
                            setEditModalVisible(true);
                            editForm.setFieldsValue({
                                description: record.description,
                                amount: record.amount,
                                currency: record.currency,
                                datetime: dayjs(record.datetime),
                                source: record.source
                            });
                        }}
                    >
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <div style={{marginBottom: 16, display: 'flex', justifyContent: 'flex-end'}}>
                <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    onClick={() => router.push('/new-transactions')}
                >
                    Add Transaction
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={transactions}
                rowKey="transaction_id"
                loading={loading}
                pagination={{pageSize: 10}}
            />


            {/* Add Reimbursement Modal */}
            <Modal
                title={`Add Reimbursement for Transaction #${selectedTx?.transaction_id}`}
                open={reimbModalVisible}
                onCancel={() => {
                    setReimbModalVisible(false);
                    reimbForm.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={reimbForm}
                    layout="vertical"
                    onFinish={handleAddReimbursement}
                >
                    <Form.Item
                        name="amount"
                        label="Reimbursement Amount"
                        rules={[{required: true, message: 'Required'}]}
                    >
                        <InputNumber style={{width: '100%'}} precision={2} prefix={selectedTx?.currency || 'LKR'}/>
                    </Form.Item>

                    <Form.Item
                        name="datetime"
                        label="Date Received"
                        rules={[{required: true, message: 'Required'}]}
                    >
                        <DatePicker showTime style={{width: '100%'}}/>
                    </Form.Item>

                    <Form.Item
                        name="source"
                        label="Recipient Source"
                    >
                        <Input placeholder="e.g. Bank Account, Cash"/>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Notes"
                    >
                        <Input.TextArea rows={2}/>
                    </Form.Item>

                    <Form.Item style={{marginBottom: 0, textAlign: 'right'}}>
                        <Space>
                            <Button onClick={() => setReimbModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}
                                    style={{background: '#52c41a', borderColor: '#52c41a'}}>
                                Save Reimbursement
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Categorize Modal */}
            <Modal
                title="Categorize Transaction"
                open={catModalVisible}
                onCancel={() => {
                    setCatModalVisible(false);
                    catForm.resetFields();
                }}
                footer={null}
                width={400}
            >
                <div style={{marginBottom: 16}}>
                    <Text type="secondary">Description:</Text>
                    <div style={{fontWeight: 'bold'}}>{selectedTx?.description || 'No description'}</div>
                </div>

                <Form
                    form={catForm}
                    layout="vertical"
                    onFinish={handleCategorize}
                >
                    <Form.Item
                        name="category_id"
                        label="Assign Category"
                        rules={[{required: true, message: 'Please select a category'}]}
                    >
                        <Select
                            showSearch={{
                                filterOption: (input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                            }}
                            placeholder="Select category"
                            options={categories.map(c => ({label: c.category, value: c.category_id}))}
                        />
                    </Form.Item>

                    <Form.Item name="saveMapping" valuePropName="checked">
                        <Checkbox>Save this mapping for future imports</Checkbox>
                    </Form.Item>

                    <Form.Item name="bulkUpdate" valuePropName="checked">
                        <Checkbox>Assign to all transactions with same description and current category</Checkbox>
                    </Form.Item>

                    <Form.Item style={{marginBottom: 0, textAlign: 'right'}}>
                        <Space>
                            <Button onClick={() => setCatModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Categorize
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Transaction Modal */}
            <Modal
                title={`Edit Transaction #${selectedTx?.transaction_id}`}
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={null}
                width={500}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditTransaction}
                >
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{required: true, message: 'Required'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Row gutter={8}>
                        <Col span={6}>
                            <Form.Item
                                name="currency"
                                label="Currency"
                                rules={[{required: true, message: 'Required'}]}
                            >
                                <Select
                                    options={[
                                        {label: 'LKR', value: 'LKR'},
                                        {label: 'USD', value: 'USD'},
                                        {label: 'EUR', value: 'EUR'},
                                        {label: 'GBP', value: 'GBP'},
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={18}>
                            <Form.Item
                                name="amount"
                                label="Amount"
                                rules={[{required: true, message: 'Required'}]}
                            >
                                <InputNumber style={{width: '100%'}} precision={2}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="datetime"
                        label="Date & Time"
                        rules={[{required: true, message: 'Required'}]}
                    >
                        <DatePicker showTime style={{width: '100%'}}/>
                    </Form.Item>

                    <Form.Item
                        name="source"
                        label="Source"
                        rules={[{required: true, message: 'Required'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item style={{marginBottom: 0, textAlign: 'right'}}>
                        <Space>
                            <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Save Changes
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}
