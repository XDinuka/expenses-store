import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
    try {
        const transactions = await request.json();

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return NextResponse.json({ error: 'No transactions provided' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const query = `
        INSERT INTO transactions (amount, category_id, datetime, source, description) 
        VALUES ?
      `;

            const values = transactions.map(tx => [
                tx.amount,
                tx.category_id,
                tx.datetime,
                tx.source,
                tx.description
            ]);

            await connection.query<ResultSetHeader>(query, [values]);
            await connection.commit();

            return NextResponse.json({ success: true, count: transactions.length });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error in batch import:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
