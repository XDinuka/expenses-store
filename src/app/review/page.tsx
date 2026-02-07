'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Select,
    Space,
    Typography,
    Table,
    Tabs,
    Spin,
    Empty
} from 'antd';
import {
    BarChartOutlined,
    CalendarOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import dynamic from 'next/dynamic';

// Dynamically import charts to avoid SSR issues
const Column = dynamic(() => import('@ant-design/plots').then((mod) => mod.Column), { ssr: false });

const { Title, Text } = Typography;

interface MonthlyStat {
    month: string;
    category: string;
    total_spent: number;
    total_reimbursed: number;
    net_amount: number;
}

export default function ReviewPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<MonthlyStat[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats/monthly');
                const data = await response.json();
                setStats(data);
                if (data.length > 0) {
                    setSelectedMonth(data[0].month);
                    setSelectedCategory(data[0].category);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        void fetchStats();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spin size="large" /></div>;
    if (stats.length === 0) return <Empty description="No transaction data available for analysis" />;

    const months = Array.from(new Set(stats.map(s => s.month)));
    const categories = Array.from(new Set(stats.map(s => s.category)));

    // Data for "Monthly Overview"
    const currentMonthData = stats.filter(s => s.month === selectedMonth);
    const totalSpent = currentMonthData.reduce((acc, curr) => acc + Number(curr.total_spent), 0);
    const totalReimbursed = currentMonthData.reduce((acc, curr) => acc + Number(curr.total_reimbursed), 0);
    const netAmount = totalSpent - totalReimbursed;

    // Chart config for Category breakdown in a month
    const categoryChartConfig = {
        data: currentMonthData.map(s => ({
            category: s.category,
            amount: Number(s.net_amount)
        })),
        xField: 'category',
        yField: 'amount',
        label: {
            position: 'top',
            style: { fill: '#FFFFFF', opacity: 0.6 },
        },
        meta: {
            category: { alias: 'Category' },
            amount: { alias: 'Net Amount (LKR)' },
        },
        color: '#1890ff',
    };

    // Data for Category Comparison across months
    const categoryComparisonData = stats
        .filter(s => s.category === selectedCategory)
        .sort((a, b) => a.month.localeCompare(b.month));

    const comparisonChartConfig = {
        data: categoryComparisonData.map(s => ({
            month: s.month,
            amount: Number(s.net_amount)
        })),
        xField: 'month',
        yField: 'amount',
        label: { position: 'top' },
        smooth: true,
        color: '#52c41a',
    };

    // Data for Monthly Total Comparison
    const monthlyTotals = months.map(m => {
        const monthItems = stats.filter(s => s.month === m);
        return {
            month: m,
            total: monthItems.reduce((acc, curr) => acc + Number(curr.net_amount), 0)
        };
    }).sort((a, b) => a.month.localeCompare(b.month));

    const monthlyTotalConfig = {
        data: monthlyTotals,
        xField: 'month',
        yField: 'total',
        label: { position: 'top' },
        color: '#f5222d',
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ marginBottom: 24 }}>Expense Analytics</Title>

            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: <span><CalendarOutlined />Monthly Overview</span>,
                    children: (
                        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                            <Card>
                                <Space size="middle">
                                    <Text strong>Select Month:</Text>
                                    <Select
                                        style={{ width: 200 }}
                                        value={selectedMonth}
                                        onChange={setSelectedMonth}
                                        options={months.map(m => ({ label: m, value: m }))}
                                    />
                                </Space>
                            </Card>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title="Total Expenses"
                                            value={totalSpent}
                                            precision={2}
                                            prefix="LKR"
                                            styles={{content:{ color: '#cf1322' }}}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title="Total Reimbursed"
                                            value={totalReimbursed}
                                            precision={2}
                                            prefix="LKR"
                                            styles={{content:{ color: '#3f8600' }}}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title="Net Spending"
                                            value={netAmount}
                                            precision={2}
                                            prefix="LKR"
                                            styles={{content:{color: '#d48806' }}}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={16}>
                                    <Card title="Spending by Category (Net Amount)">
                                        <Column {...categoryChartConfig} />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card title="Category Totals">
                                        <Table
                                            dataSource={currentMonthData}
                                            pagination={false}
                                            size="small"
                                            columns={[
                                                { title: 'Category', dataIndex: 'category', key: 'category' },
                                                {
                                                    title: 'Net (LKR)',
                                                    dataIndex: 'net_amount',
                                                    key: 'net_amount',
                                                    render: (val) => Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                                }
                                            ]}
                                            rowKey="category"
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Space>
                    )
                },
                {
                    key: '2',
                    label: <span><ShoppingOutlined />Category Comparison</span>,
                    children: (
                        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                            <Card>
                                <Space size="middle">
                                    <Text strong>Select Category:</Text>
                                    <Select
                                        style={{ width: 200 }}
                                        value={selectedCategory}
                                        onChange={setSelectedCategory}
                                        options={categories.map(c => ({ label: c, value: c }))}
                                    />
                                </Space>
                            </Card>

                            <Card title={`Historical Spending: ${selectedCategory}`}>
                                <Column {...comparisonChartConfig} />
                            </Card>

                            <Card title="Data Breakdown">
                                <Table
                                    dataSource={categoryComparisonData}
                                    columns={[
                                        { title: 'Month', dataIndex: 'month', key: 'month' },
                                        {
                                            title: 'Expenses',
                                            dataIndex: 'total_spent',
                                            render: (v) => `රු${Number(v).toFixed(2)}`
                                        },
                                        {
                                            title: 'Reimbursed',
                                            dataIndex: 'total_reimbursed',
                                            render: (v) => `රු${Number(v).toFixed(2)}`
                                        },
                                        {
                                            title: 'Net Amount',
                                            dataIndex: 'net_amount',
                                            render: (v) => <Text strong>රු${Number(v).toFixed(2)}</Text>
                                        }
                                    ]}
                                    rowKey="month"
                                />
                            </Card>
                        </Space>
                    )
                },
                {
                    key: '3',
                    label: <span><BarChartOutlined />Monthly Comparison</span>,
                    children: (
                        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                            <Card title="Monthly Spending Trend (All Categories Combined)">
                                <Column {...monthlyTotalConfig} />
                            </Card>

                            <Card title="Monthly Summaries">
                                <Table
                                    dataSource={monthlyTotals}
                                    columns={[
                                        { title: 'Month', dataIndex: 'month', key: 'month' },
                                        {
                                            title: 'Total Net Spending',
                                            dataIndex: 'total',
                                            render: (v) => <Text strong style={{ color: '#cf1322' }}>රු${Number(v).toFixed(2)}</Text>
                                        }
                                    ]}
                                    rowKey="month"
                                />
                            </Card>
                        </Space>
                    )
                }
            ]} />
        </div>
    );
}
