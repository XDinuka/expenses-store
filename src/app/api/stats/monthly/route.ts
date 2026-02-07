import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const query = `
      SELECT 
        DATE_FORMAT(t.datetime, '%Y-%m') as month,
        c.category,
        SUM(t.amount) as total_spent,
        COALESCE(SUM(reimb.total_reimbursed), 0) as total_reimbursed,
        SUM(t.amount) - COALESCE(SUM(reimb.total_reimbursed), 0) as net_amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      LEFT JOIN (
        SELECT transaction_id, SUM(amount) as total_reimbursed
        FROM reimbursements
        GROUP BY transaction_id
      ) reimb ON t.transaction_id = reimb.transaction_id
      GROUP BY month, c.category
      ORDER BY month DESC, c.category ASC
    `;

        const [rows] = await pool.query<RowDataPacket[]>(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
