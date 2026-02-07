'use client';

import React, { useState } from 'react';
import { Layout, Menu, theme, Button } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TransactionOutlined,
    TagsOutlined,
    DashboardOutlined,
    CloudUploadOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const { Header, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/transactions',
            icon: <TransactionOutlined />,
            label: 'Transactions',
        },
        {
            key: '/new-transactions',
            icon: <TransactionOutlined />,
            label: 'New Transactions',
        },
        {
            key: '/categories',
            icon: <TagsOutlined />,
            label: 'Categories',
        },
        {
            key: '/import',
            icon: <CloudUploadOutlined />,
            label: 'Import CSV',
        },
        {
            key: '/review',
            icon: <BarChartOutlined />,
            label: 'Review',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
                <div style={{
                    height: 32,
                    margin: 16,
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                }}>
                    {collapsed ? 'ES' : 'EXPENSES STORE'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    onClick={({ key }) => router.push(key)}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <h2 style={{ margin: 0 }}>{menuItems.find(item => item.key === pathname)?.label || 'Expense Store'}</h2>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        overflow: 'auto'
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
