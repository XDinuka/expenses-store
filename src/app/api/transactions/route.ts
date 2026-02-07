import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const query = `
      SELECT t.*, c.category,
             COALESCE((SELECT SUM(r.amount) FROM reimbursements r WHERE r.transaction_id = t.transaction_id), 0) as reimbursed_amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      ORDER BY t.datetime DESC
    `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { amount, description, category_id, datetime, source } = await req.json();

        if (!amount || !category_id || !datetime || !source) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO transactions (amount, description, category_id, datetime, source) VALUES (?, ?, ?, ?, ?)',
            [amount, description, category_id, datetime, source]
        );

        return NextResponse.json({
            transaction_id: result.insertId,
            amount,
            description,
            category_id,
            datetime,
            source
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
