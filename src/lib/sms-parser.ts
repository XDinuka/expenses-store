import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export interface ParsedSMS {
    amount: number;
    currency: string;
    datetime: string;
    source: string;
    description: string;
    category_id: number; // Will default to an "Uncategorized" or similar if possible
}

// These are placeholder patterns. The user will provide real ones later.
const PATTERNS = [
    {
        name: 'DFCC CC',
        regex: /:\s+(?<merchant>.+?)\sCARD\*\*(?<source>\d{4})\s+DEBITED\s+(?<currency>[A-Z]{3})\s+(?<amount>[\d,]+\.\d{2})\s+ON\((?<datetime>\d{2}\/[A-Z]{3}\/\d{4}\s+\d{2}:\d{2})\)/i,

        map: (match: RegExpMatchArray): Partial<ParsedSMS> => {
            const { amount, merchant, datetime, source, currency } = match.groups || {};
            return {
                amount: amount ? parseFloat(amount.replace(/,/g, '')) : 0,
                currency: currency || 'LKR',
                description: merchant?.trim(),
                datetime: datetime ? dayjs(datetime).format('YYYY-MM-DD HH:mm:ss') : undefined,
                source: source?.trim(),
            };
        }
    } ,
    {
        name: 'Combank CC',
        regex: /Purchase\s+at\s+(?<merchant>.+?)\s+for\s+(?<currency>[A-Z]{3})\s+(?<amount>[\d,]+\.\d{2})\s+on\s+(?<datetime>\d{2}\/\d{2}\/\d{2}\s+\d{2}:\d{2}\s+[AP]M).*?card\s+#(?<source>\d{4})/i,

        map: (match: RegExpMatchArray): Partial<ParsedSMS> => {
            const { amount, merchant, datetime, source, currency } = match.groups || {};
            console.log({
                datetime,
                dj: dayjs(datetime,'DD/MM/YY hh:mm A') //15/07/23 02:06 PM
            })
            return {
                amount: amount ? parseFloat(amount.replace(/,/g, '')) : 0,
                currency: currency || 'LKR',
                description: merchant?.trim(),
                datetime: datetime ? dayjs(datetime,'DD/MM/YY hh:mm A').format('YYYY-MM-DD HH:mm:ss') : undefined,
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
                currency: data.currency || 'LKR',
                datetime: data.datetime || dayjs().format('YYYY-MM-DD HH:mm:ss'),
                source: data.source || 'Unknown',
                description: data.description || text.substring(0, 100),
                category_id: 1, // Defaulting to 1 (General/Uncategorized)
            };
        }
    }
    return null;
}
