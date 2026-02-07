import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM categories ORDER BY category ASC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { category } = await req.json();
        if (!category) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO categories (category) VALUES (?)',
            [category]
        );

        return NextResponse.json({ category_id: result.insertId, category }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating category:', error);
        if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
