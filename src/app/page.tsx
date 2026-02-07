'use client';

import {Card, Col, Row, Statistic, Typography} from 'antd';
import {TagsOutlined, TransactionOutlined, WalletOutlined} from '@ant-design/icons';

const {Title, Paragraph} = Typography;

export default function Home() {
    return (
        <div style={{padding: '20px'}}>
            <Title level={2}>Welcome to Expense Store</Title>
            <Paragraph>
                Manage your personal finances, track transactions, and organize your categories efficiently.
            </Paragraph>

            <Row gutter={16} style={{marginTop: '32px'}}>
                <Col span={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Transactions"
                            value="Manage"
                            prefix={<TransactionOutlined/>}
                            styles={{content: {color: '#3f51b5'}}}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Categories"
                            value="Organize"
                            prefix={<TagsOutlined/>}
                            styles={{content: {color: '#cf1322'}}}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Reimbursements"
                            value="Track"
                            prefix={<WalletOutlined/>}
                            styles={{content: {color: '#3f8600'}}}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{marginTop: '32px'}}>
                <Title level={4}>Getting Started</Title>
                <ul style={{lineHeight: '2'}}>
                    <li>Go to <b>Categories</b> to define your expense types (e.g., Food, Travel).</li>
                    <li>Navigate to <b>Transactions</b> to record your daily spending.</li>
                    <li>Use the <b>Add Reimbursement</b> button on any transaction to track money coming back.</li>
                </ul>
            </Card>
        </div>
    );
}
