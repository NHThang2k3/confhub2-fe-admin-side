// src/components/logAnalysis/Analysis/JournalDetails.tsx
import React from 'react';

// Define an interface for the expected journal analysis data structure
// Replace this with the actual structure returned by your backend
interface JournalAnalysisData {
    totalJournalsProcessed?: number;
    averageSJR?: number;
    quartileDistribution?: Record<string, number>;
    topHIndexJournals?: Array<{ Title: string; 'H index': string }>;
    // ... other relevant journal metrics
}

interface JournalDetailsProps {
    // Allow the data to be potentially undefined or null if not available
    journalAnalysis: JournalAnalysisData | undefined | null;
}

const JournalDetails: React.FC<JournalDetailsProps> = ({ journalAnalysis }) => {
    // Handle case where data might not be available for journals
    if (!journalAnalysis || Object.keys(journalAnalysis).length === 0) {
        return (
            <div className="mt-6 text-center text-gray-500 bg-white p-6 rounded-lg shadow border border-gray-200">
                No specific Journal analysis data available for the selected period.
            </div>
        );
    }

    // --- Render Actual Journal Details (Example Structure) ---
    // Replace this with your actual rendering logic based on journalAnalysis data
    return (
        <div className="mt-6 bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200 space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
                Journal Analysis Details
            </h3>

            {/* Example: Displaying some metrics */}
            {journalAnalysis.totalJournalsProcessed !== undefined && (
                <p><span className="font-medium">Total Journals Processed:</span> {journalAnalysis.totalJournalsProcessed}</p>
            )}
            {journalAnalysis.averageSJR !== undefined && (
                 <p><span className="font-medium">Average SJR:</span> {journalAnalysis.averageSJR.toFixed(3)}</p>
             )}

            {journalAnalysis.quartileDistribution && (
                <div>
                    <h4 className="font-medium mb-1">Quartile Distribution:</h4>
                    <ul className="list-disc list-inside text-sm">
                        {Object.entries(journalAnalysis.quartileDistribution).map(([quartile, count]) => (
                            <li key={quartile}>{quartile}: {count}</li>
                        ))}
                    </ul>
                </div>
            )}

             {journalAnalysis.topHIndexJournals && journalAnalysis.topHIndexJournals.length > 0 && (
                <div>
                    <h4 className="font-medium mb-1">Top H-Index Journals (Sample):</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {journalAnalysis.topHIndexJournals.slice(0, 5).map((journal, index) => ( // Show top 5 example
                            <li key={index}>{journal.Title} (H-Index: {journal['H index']})</li>
                        ))}
                    </ul>
                </div>
            )}

            <p className="mt-4 text-sm text-gray-400 pt-4 border-t">
                (Placeholder: More detailed journal analysis visualization can be added here)
            </p>
        </div>
    );
};

export default JournalDetails;