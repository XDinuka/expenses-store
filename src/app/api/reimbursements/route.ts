import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(req: NextRequest) {
    try {
        const { amount, transaction_id, description, datetime, source } = await req.json();

        if (!amount || !transaction_id || !datetime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO reimbursements (amount, transaction_id, description, datetime, source) VALUES (?, ?, ?, ?, ?)',
            [amount, transaction_id, description, datetime, source]
        );

        return NextResponse.json({
            reimbursement_id: result.insertId,
            amount,
            transaction_id,
            description,
            datetime,
            source
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating reimbursement:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
