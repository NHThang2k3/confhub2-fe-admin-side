// src/app/api/journals/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { JournalResponse } from '@/src/models/response/journal.response'; // Điều chỉnh đường dẫn nếu cần

// Hàm đọc và parse một file JSONL
async function readJsonlFile(filePath: string): Promise<JournalResponse[]> {
    try {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const lines = fileContent.trim().split('\n');
        const journals: JournalResponse[] = lines
            .map((line) => {
                if (!line.trim()) return null; // Bỏ qua dòng trống
                try {
                    return JSON.parse(line) as JournalResponse;
                } catch (parseError) {
                    console.error(`Error parsing line in ${filePath}:`, line, parseError);
                    return null; // Bỏ qua dòng lỗi
                }
            })
            .filter((journal): journal is JournalResponse => journal !== null); // Loại bỏ các giá trị null
        return journals;
    } catch (readError) {
        console.error(`Error reading file ${filePath}:`, readError);
        return []; // Trả về mảng rỗng nếu lỗi đọc file
    }
}

export async function GET() {
    try {
        const dataDir = path.join(process.cwd(), 'src', 'models', 'journalData');
        const allFiles = await fs.promises.readdir(dataDir);
        const jsonlFiles = allFiles.filter(file => file.endsWith('.jsonl'));

        if (jsonlFiles.length === 0) {
            console.warn("No .jsonl files found in", dataDir);
            return NextResponse.json([]); // Trả về mảng rỗng nếu không có file
        }

        let allJournals: JournalResponse[] = [];

        // Đọc từng file và gộp kết quả
        for (const file of jsonlFiles) {
            const filePath = path.join(dataDir, file);
            const journalsFromFile = await readJsonlFile(filePath);
            allJournals = allJournals.concat(journalsFromFile);
            console.log(`Read ${journalsFromFile.length} journals from ${file}. Total: ${allJournals.length}`);
        }

        console.log(`Successfully loaded a total of ${allJournals.length} journals from ${jsonlFiles.length} files.`);
        return NextResponse.json(allJournals);

    } catch (error) {
        console.error('Failed to load journals:', error);
        return NextResponse.json({ message: 'Internal Server Error: Failed to load journals' }, { status: 500 });
    }
}