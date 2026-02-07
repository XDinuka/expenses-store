import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const updates: string[] = [];
        const values: any[] = [];

        if (body.category_id !== undefined) {
            updates.push('category_id = ?');
            values.push(body.category_id);
        }
        if (body.description !== undefined) {
            updates.push('description = ?');
            values.push(body.description);
        }
        if (body.amount !== undefined) {
            updates.push('amount = ?');
            values.push(body.amount);
        }
        if (body.datetime !== undefined) {
            updates.push('datetime = ?');
            values.push(body.datetime);
        }
        if (body.source !== undefined) {
            updates.push('source = ?');
            values.push(body.source);
        }

        if (body.bulkUpdate && body.description !== undefined && body.old_category_id !== undefined) {
            const [bulkResult] = await pool.query<ResultSetHeader>(
                'UPDATE transactions SET category_id = ? WHERE description = ? AND category_id = ?',
                [body.category_id, body.description, body.old_category_id]
            );
            return NextResponse.json({ success: true, updatedCount: bulkResult.affectedRows });
        }

        if (updates.length > 0) {
            values.push(id);
            const [result] = await pool.query<ResultSetHeader>(
                `UPDATE transactions SET ${updates.join(', ')} WHERE transaction_id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
