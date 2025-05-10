// components/RecommendedJournals.tsx
import React from 'react';
import Image from 'next/image'; // Import Image component
import journalData from '../../../../models/data/journals-list.json'; // Import journalData from the specified path
import { JournalResponse } from '../../../../models/response/journal.response'; // Import JournalResponse

export const RecommendedJournals: React.FC = () => {
  // Get the first 5 journals from journalData (assuming they are "recently added" in the order of the JSON file)
  // Ensure journalData is cast to JournalResponse[] to match the expected type
  const journals = (journalData as any[] as JournalResponse[]).slice(0, 5);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-xl font-semibold  text-center mt-4 mb-4 uppercase">Recently Added Journals</h2>
      <p className=" text-center mb-8 text-2xl">Explore recommended and recent journals</p>
      <div className="overflow-x-auto whitespace-nowrap flex justify-center items-start gap-4 pb-4">
        {journals.map((journal, index) => (
          <JournalCard key={index} journal={journal} />
        ))}
      </div>
    </div>
  );
};

interface JournalCardProps {
  journal: JournalResponse;
}

const JournalCard: React.FC<JournalCardProps> = ({
  journal,
}) => {
  // Extract category from Subject Area and Category -> Topics, default to "General" if not available
  const category = journal["Subject Area and Category"]?.Topics && journal["Subject Area and Category"].Topics.length > 0
    ? journal["Subject Area and Category"].Topics[0]
    : 'General';

  return (
    <div className="bg-background rounded-lg shadow-md w-60 min-w-60 relative">
      <div className="relative w-full h-80 overflow-hidden">
        <div className={`absolute top-0 left-0 z-10 p-1 px-2 text-xs font-medium  rounded-tl-lg rounded-br-lg bg-secondary text-background`}> {/* Added background color for better visibility */}
          {category}
        </div>
        <div className="relative w-full h-full">
          <img
            src={journal.Image || "https://via.placeholder.com/150/FFFFFF/808080?text=No+Image"}
            alt={journal.Title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-1 truncate">{journal.Title}</h3>
        <p className="text-xs truncate">{journal.Publisher}</p>
      </div>

    </div>
  );
};