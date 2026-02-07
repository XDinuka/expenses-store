import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM descriptions');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching descriptions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { description, category } = await req.json();
        if (!description || !category) {
            return NextResponse.json({ error: 'Description and category are required' }, { status: 400 });
        }

        await pool.query(
            'INSERT INTO descriptions (description, category) VALUES (?, ?) ON DUPLICATE KEY UPDATE category = ?',
            [description, category, category]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving description mapping:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
