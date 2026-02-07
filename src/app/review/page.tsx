'use client';

import React, {useEffect, useState} from 'react';
import {Card, Col, Empty, Row, Select, Space, Spin, Statistic, Table, Tabs, Typography} from 'antd';
import {BarChartOutlined, CalendarOutlined, ShoppingOutlined} from '@ant-design/icons';
import dynamic from 'next/dynamic';

// Dynamically import charts to avoid SSR issues
const Column = dynamic(() => import('@ant-design/plots').then((mod) => mod.Column), {ssr: false});

const {Title, Text} = Typography;

interface MonthlyStat {
    month: string;
    currency: string;
    category: string;
    total_spent: number;
    total_reimbursed: number;
    net_amount: number;
}

const commonChartConfigs = {
    label: {
        position: 'top',
        style: {fill: '#001529', opacity: 100},
        textBaseline: 'bottom',
    },
    style: {
        radiusTopLeft: 10,
        radiusTopRight: 10,
        fill: '#001529',
    }
}

export default function ReviewPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<MonthlyStat[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedCurrency, setSelectedCurrency] = useState<string>('LKR');

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

    if (loading) return <div style={{display: 'flex', justifyContent: 'center', padding: '100px'}}><Spin size="large"/>
    </div>;
    if (stats.length === 0) return <Empty description="No transaction data available for analysis"/>;

    const currencies = Array.from(new Set(stats.map(s => s.currency))).sort();
    const filteredStats = stats.filter(s => s.currency === selectedCurrency);

    if (filteredStats.length === 0 && stats.length > 0) {
        // If no data for selected currency, but data exists for others, show empty or handle
    }

    const months = Array.from(new Set(filteredStats.map(s => s.month))).sort((a, b) => b.localeCompare(a));
    const categories = Array.from(new Set(filteredStats.map(s => s.category))).sort();

    // Data for "Monthly Overview"
    const currentMonthData = filteredStats.filter(s => s.month === selectedMonth);
    const totalSpent = currentMonthData.reduce((acc, curr) => acc + Number(curr.total_spent), 0);
    const totalReimbursed = currentMonthData.reduce((acc, curr) => acc + Number(curr.total_reimbursed), 0);
    const netAmount = totalSpent - totalReimbursed;

    // Chart config for Category breakdown in a month
    const categoryChartConfig = {
        ...commonChartConfigs,
        data: currentMonthData.map(s => ({
            category: s.category,
            amount: Number(s.net_amount)
        })),
        xField: 'category',
        yField: 'amount',
        meta: {
            category: {alias: 'Category'},
            amount: {alias: `Net Amount (${selectedCurrency})`},
        }
    };

    // Data for Category Comparison across months
    const categoryComparisonData = filteredStats
        .filter(s => s.category === selectedCategory)
        .sort((a, b) => b.month.localeCompare(a.month));

    const comparisonChartConfig = {
        ...commonChartConfigs,
        data: categoryComparisonData.map(s => ({
            month: s.month,
            amount: Number(s.net_amount)
        })),
        xField: 'month',
        yField: 'amount',
        smooth: true,
    };

    // Data for Monthly Total Comparison
    const monthlyTotals = months.map(m => {
        const monthItems = filteredStats.filter(s => s.month === m);
        return {
            month: m,
            total: monthItems.reduce((acc, curr) => acc + Number(curr.net_amount), 0)
        };
    }).sort((a, b) => a.month.localeCompare(b.month));

    const monthlyTotalConfig = {
        ...commonChartConfigs,
        data: monthlyTotals,
        xField: 'month',
        yField: 'total',


    };

    return (
        <div style={{maxWidth: 1200, margin: '0 auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <Title level={2} style={{margin: 0}}>Expense Analytics</Title>
                <Space>
                    <Text strong>Currency:</Text>
                    <Select
                        style={{width: 100}}
                        value={selectedCurrency}
                        onChange={(val) => {
                            setSelectedCurrency(val);
                            // Reset selected month/category if they don't exist in the new currency?
                            // Actually better to just let them be or reset to first found.
                        }}
                        options={currencies.map(c => ({label: c, value: c}))}
                    />
                </Space>
            </div>

            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: <span><CalendarOutlined/>Monthly Overview</span>,
                    children: (
                        <Space orientation="vertical" size="large" style={{width: '100%'}}>
                            <Card>
                                <Space size="middle">
                                    <Text strong>Select Month:</Text>
                                    <Select
                                        style={{width: 200}}
                                        value={selectedMonth}
                                        onChange={setSelectedMonth}
                                        options={months.map(m => ({label: m, value: m}))}
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
                                            prefix={selectedCurrency}
                                            styles={{content: {color: '#cf1322'}}}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title="Total Reimbursed"
                                            value={totalReimbursed}
                                            precision={2}
                                            prefix={selectedCurrency}
                                            styles={{content: {color: '#3f8600'}}}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title="Net Spending"
                                            value={netAmount}
                                            precision={2}
                                            prefix={selectedCurrency}
                                            styles={{content: {color: '#d48806'}}}
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
                                                {title: 'Category', dataIndex: 'category', key: 'category'},
                                                {
                                                    title: `Net (${selectedCurrency})`,
                                                    dataIndex: 'net_amount',
                                                    key: 'net_amount',
                                                    render: (val) => Number(val).toLocaleString(undefined, {minimumFractionDigits: 2})
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
                    label: <span><ShoppingOutlined/>Category Comparison</span>,
                    children: (
                        <Space orientation="vertical" size="large" style={{width: '100%'}}>
                            <Card>
                                <Space size="middle">
                                    <Text strong>Select Category:</Text>
                                    <Select
                                        style={{width: 200}}
                                        value={selectedCategory}
                                        onChange={setSelectedCategory}
                                        options={categories.map(c => ({label: c, value: c}))}
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
                                        {title: 'Month', dataIndex: 'month', key: 'month'},
                                        {
                                            title: 'Expenses',
                                            dataIndex: 'total_spent',
                                            render: (v) => `${selectedCurrency} ${Number(v).toFixed(2)}`
                                        },
                                        {
                                            title: 'Reimbursed',
                                            dataIndex: 'total_reimbursed',
                                            render: (v) => `${selectedCurrency} ${Number(v).toFixed(2)}`
                                        },
                                        {
                                            title: 'Net Amount',
                                            dataIndex: 'net_amount',
                                            render: (v) => <Text strong>{selectedCurrency} {Number(v).toFixed(2)}</Text>
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
                    label: <span><BarChartOutlined/>Monthly Comparison</span>,
                    children: (
                        <Space orientation="vertical" size="large" style={{width: '100%'}}>
                            <Card title="Monthly Spending Trend (All Categories Combined)">
                                <Column {...monthlyTotalConfig} />
                            </Card>

                            <Card title="Monthly Summaries">
                                <Table
                                    dataSource={monthlyTotals}
                                    columns={[
                                        {title: 'Month', dataIndex: 'month', key: 'month'},
                                        {
                                            title: 'Total Net Spending',
                                            dataIndex: 'total',
                                            render: (v) => <Text strong
                                                                 style={{color: '#cf1322'}}>{selectedCurrency} {Number(v).toFixed(2)}</Text>
                                        }
                                    ]}
                                    rowKey="month"
                                />
                            </Card>
                        </Space>
                    )
                }
            ]}/>
        </div>
    );
}
