import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM sources');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching sources:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
