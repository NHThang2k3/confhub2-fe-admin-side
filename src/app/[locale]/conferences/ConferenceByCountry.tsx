import React from 'react';
import continentList from '../../../models/data/continents-list.json';


const ConferenceByCountry: React.FC = () => {
  const continentsData = continentList;
  return (
    <div className="bg-background min-h-screen  py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">Conference by Country</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {continentsData.map((continent, index) => (
            <div key={index} className="bg-gradient-to-r from-background to-background-secondary rounded-lg shadow-md overflow-hidden ">
            <div className="px-6 py-4 border-b flex items-center space-x-2">
              <span className="text-xl">{continent.flag}</span>
              <h2 className="text-lg font-semibold">{continent.name}</h2>
            </div>
            <div className="px-6 py-4">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-background-secondary scrollbar-track-background ">
                {continent.countries.map((country, countryIndex) => (
                  <li key={countryIndex} className="flex items-center space-x-1">
                    <span className=" mr-1"></span>
                    <span>{country}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConferenceByCountry;