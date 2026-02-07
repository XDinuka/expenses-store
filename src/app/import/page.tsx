'use client';

import React, { useState, useEffect } from 'react';
import {
    Upload,
    Button,
    Table,
    Card,
    message,
    Typography,
    Space,
    Alert,
    Tag
} from 'antd';
import { InboxOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { parseSMS, ParsedSMS } from '@/lib/sms-parser';
import { useRouter } from 'next/navigation';
import { Category, DescriptionMapping, SourceMapping } from '@/types';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function ImportPage() {
    const [data, setData] = useState<ParsedSMS[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [mappings, setMappings] = useState<DescriptionMapping[]>([]);
    const [sourceMappings, setSourceMappings] = useState<SourceMapping[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, mapRes, srcRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/descriptions'),
                    fetch('/api/sources')
                ]);
                const catData = await catRes.json();
                const mapData = await mapRes.json();
                const srcData = await srcRes.json();
                setCategories(catData);
                setMappings(mapData);
                setSourceMappings(srcData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                message.error('Failed to load metadata');
            }
        };
        void fetchData();
    }, []);

    const handleFileUpload = (file: File) => {
        setLoading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields || [];
                const smsHeader = headers.find(h => h.toLowerCase() === 'sms');

                if (!smsHeader) {
                    message.error('CSV MUST contain an "SMS" column (case-insensitive)');
                    setLoading(false);
                    return;
                }

                const parsedEntries: ParsedSMS[] = [];
                results.data.forEach((row: any) => {
                    const smsText = row[smsHeader];
                    if (smsText) {
                        const parsed = parseSMS(smsText);
                        if (parsed) {
                            // Try to find a matching category by description
                            const mapping = mappings.find(m =>
                                parsed.description.toLowerCase().includes(m.description.toLowerCase())
                            );

                            if (mapping) {
                                const matchedCat = categories.find(c => c.category === mapping.category);
                                if (matchedCat) {
                                    parsed.category_id = matchedCat.category_id;
                                }
                            }

                            // Try to find a standardized source name
                            const srcMapping = sourceMappings.find(s => s.reference === parsed.source);
                            if (srcMapping) {
                                parsed.source = srcMapping.source;
                            }

                            parsedEntries.push(parsed);
                        }
                    }
                });

                if (parsedEntries.length === 0) {
                    message.warning('No transactions could be extracted from the SMS column using current patterns.');
                } else {
                    message.success(`Extracted ${parsedEntries.length} transactions.`);
                }

                setData(parsedEntries);
                setLoading(false);
            },
            error: (err) => {
                message.error(`Parsing error: ${err.message}`);
                setLoading(false);
            }
        });
        return false; // Prevent default upload behavior
    };

    const handleSaveAll = async () => {
        if (data.length === 0) return;

        setLoading(true);
        try {
            const response = await fetch('/api/transactions/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to save transactions');

            const result = await response.json();
            message.success(`Successfully saved ${result.count} transactions!`);
            router.push('/transactions');
        } catch (error) {
            console.error('Error saving batch:', error);
            message.error('Failed to save transactions');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'datetime',
            key: 'datetime',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => <Text strong color="red">LKR{val.toFixed(2)}</Text>
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Category',
            dataIndex: 'category_id',
            key: 'category_id',
            render: (catId: number) => {
                const cat = categories.find(c => c.category_id === catId);
                return <Tag color="blue">{cat?.category || 'Uncategorized'}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, __: any, index: number) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                        const newData = [...data];
                        newData.splice(index, 1);
                        setData(newData);
                    }}
                />
            )
        }
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2}>Import Transactions</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Upload a CSV file containing an SMS column to extract transaction data using predefined regex patterns.
            </Text>

            <Card style={{ marginBottom: 24 }}>
                <Dragger
                    accept=".csv"
                    beforeUpload={handleFileUpload}
                    showUploadList={false}
                    disabled={loading}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for single CSV file containing bank/payment SMS logs.
                    </p>
                </Dragger>
            </Card>

            {data.length > 0 && (
                <Card title={`Preview (${data.length} transactions)`} extra={
                    <Space>
                        <Button onClick={() => setData([])} icon={<DeleteOutlined />}>Clear All</Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={loading}
                            onClick={handleSaveAll}
                        >
                            Save All to Database
                        </Button>
                    </Space>
                }>
                    <Table
                        dataSource={data}
                        columns={columns}
                        rowKey={(record) => `${record.datetime}-${record.description}`}
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            )}

            {data.length === 0 && !loading && (
                <Alert
                    title="No data yet"
                    description="Drag and drop your CSV file above to get started. Make sure your CSV has an 'SMS' column."
                    type="info"
                    showIcon
                />
            )}
        </div>
    );
}
