import dayjs from 'dayjs';

export interface ParsedSMS {
    amount: number;
    datetime: string;
    source: string;
    description: string;
    category_id: number; // Will default to a "Uncategorized" or similar if possible
}

// These are placeholder patterns. The user will provide real ones later.
const PATTERNS = [
    {
        name: 'DFCC CC',
        regex: /:\s+(?<merchant>.+?)\sCARD\*\*(?<source>\d{4})\s+DEBITED\s+(?<currency>[A-Z]{3})\s+(?<amount>[\d,]+\.\d{2})\s+ON\((?<datetime>\d{2}\/[A-Z]{3}\/\d{4}\s+\d{2}:\d{2})\)/i,

        map: (match: RegExpMatchArray): Partial<ParsedSMS> => {
            const { amount, merchant, datetime, source } = match.groups || {};
            return {
                amount: amount ? parseFloat(amount.replace(/,/g, '')) : 0,
                description: merchant?.trim(),
                datetime: datetime ? dayjs(datetime).format('YYYY-MM-DD HH:mm:ss') : undefined,
                source: source?.trim(),
            };
        }
    }
];

export function parseSMS(text: string): ParsedSMS | null {


    for (const pattern of PATTERNS) {
        const match = text.match(pattern.regex);
        if (match) {
            const data = pattern.map(match);
            return {
                amount: data.amount || 0,
                datetime: data.datetime || dayjs().format('YYYY-MM-DD HH:mm:ss'),
                source: data.source || 'Unknown',
                description: data.description || text.substring(0, 100),
                category_id: 1, // Defaulting to 1 (General/Uncategorized)
            };
        }
    }
    return null;
}
