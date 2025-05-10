"use client" 
import React from 'react';
import topicList from '../../../models/data/topics-list.json';

const ConferenceByTopic: React.FC = () => {
  type TopicData = {
    [key: string]: string[];
  };

  const topicData = topicList as TopicData;

  const categories = Object.keys(topicData);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Business And Economics'); // Default to Engineering

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="antialiased bg-backround">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Conference By Topics</h1>
        <div className="flex">
          {/* Left Navigation */}
          <div className="w-1/4 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-md overflow-hidden">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(category)}
                className={`px-6 py-3 cursor-pointer hover:bg-button-text ${
                  category === selectedCategory ? 'bg-span-bg text-button-text font-semibold' : ''
                }`}
              >
                {category}
              </div>
            ))}
          </div>

          {/* Right Content */}
          <div className="w-3/4 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-md ml-6">
            <div className="bg-span-bg text-button-text rounded-t-md py-3 px-6 mb-4">
              <h2 className="font-semibold">{selectedCategory}</h2>
            </div>
            <div className="flex px-6">
              <div className="w-1/2 pr-4">
                <ul>
                  {topicData[selectedCategory]
                    ?.slice(0, Math.ceil(topicData[selectedCategory].length / 2)) // Dynamically split subtopics
                    .map((topic, index) => (
                      <li key={index} className="py-1 list-inside">
                        {topic}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="w-1/2">
                <ul>
                  {topicData[selectedCategory]
                    ?.slice(Math.ceil(topicData[selectedCategory].length / 2)) // Dynamically split subtopics
                    .map((topic, index) => (
                      <li key={index} className="py-1 list-inside">
                        {topic}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferenceByTopic;