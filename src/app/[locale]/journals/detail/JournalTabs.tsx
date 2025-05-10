"use client";

// components/JournalTabs.tsx
import React, { useEffect, useRef } from 'react'; // Import useRef
import Image from 'next/image'; // Import the Image component from next/image
import { JournalResponse } from '../../../../models/response/journal.response'; // Import JournalResponse

interface JournalTabsProps {
    journal: JournalResponse; // Define the journal prop
}

export const JournalTabs: React.FC<JournalTabsProps> = ({ journal }) => { // Update component signature to accept props
    const navRef = useRef<HTMLElement>(null); // Create a ref for the nav element

    useEffect(() => {
        const handleAnchorClick = (event: Event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const target = event.target as HTMLAnchorElement;
            const targetId = target.getAttribute('href')?.substring(1); // Remove the '#'
            if (targetId) {
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const navElement = navRef.current; // Use navRef.current here
                    const navHeight = navElement ? navElement.offsetHeight : 0; // Get nav height, default to 0 if not found
                    const offset = 50;
                    const targetPosition = targetSection.offsetTop - navHeight - offset; // Calculate scroll position with offset

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth',
                    });
                }
            }
        };

        const navLinks = navRef.current?.querySelectorAll('a') || []; // Use navRef.current to query only within this nav
        navLinks.forEach(link => {
            link.addEventListener('click', handleAnchorClick);
        });

        return () => { // Cleanup event listeners when component unmounts
            navLinks.forEach(link => {
                link.removeEventListener('click', handleAnchorClick);
            });
        };
    }, []); // Empty dependency array ensures this effect runs only once after initial render

    return (
        <div className="container mx-auto py-6 rounded-lg md:flex-row " style={{ scrollBehavior: 'smooth' }}>
            <nav ref={navRef} className="sticky top-14 bg-gradient-to-r from-background to-background-secondary shadow-md z-20 flex overflow-x-auto mt-1 whitespace-nowrap p-3 text-lg">
                <a
                    href="#overview"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Overview
                </a>
                <a
                    href="#impact-factor"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Impact Factor
                </a>
                <a
                    href="#h-index"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                    >
                    H-index
                </a>
                <a
                    href="#sjr"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    SJR
                </a>
                <a
                    href="#subject-area-category"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Subject Area and Category
                </a>
            </nav>

            <section id="overview" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Overview</h2>
                <div className=" text-lg">
                    {/* Use journal data for overview, if available */}
                    <div>{journal.Scope ?? journal['Additional Info']?.slice(5)}</div> {/* Using Scope from journal data */}
                </div>
            </section>

            <section id="impact-factor" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Impact Factor</h2>
                <div className=" text-lg">
                    <strong>The Impact IF {journal.bioxbio ? journal.bioxbio[0]?.Year: new Date().getFullYear()}</strong> of <strong>{journal.Title}</strong> is 
                    <strong>{journal.bioxbio ? ' ' + journal.bioxbio[0]?.Impact_factor : ' N/A'}</strong>
                    {journal.bioxbio && <div className='inline'>, which is computed in <strong>{parseInt(journal.bioxbio[0]?.Year || '2023') + 1}</strong> as per its definition.</div>}  
                    {/* ... rest of the Impact Factor tab content, you can dynamically update journal name and IF value here */}
                </div>
                <p className=" text-lg mt-4 mb-4">
                    The impact IF, also denoted as <strong>Journal Impact Score (JIS)</strong>, of an academic journal is a
                    measure of the yearly average
                    number of citations to recent articles published in that journal. It is based on <strong>Scopus </strong>
                    data.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-background shadow-md rounded-lg">
                    {/* Left Column: Table */}
                    <div>
                        <table className="w-full text-lg text-left  border-collapse">
                            <thead className="text-lg  ">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-semibold text-left">Year</th>
                                    <th scope="col" className="px-6 py-3 font-semibold text-left">Impact Factor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {journal.bioxbio?.map((history, index) => ( // Use journal.bioxbio
                                    <tr key={index} className="border-b  ">
                                        <td className="px-6 py-2">{history.Year}</td>
                                        <td className="px-6 py-2">{history.Impact_factor}</td>
                                    </tr>
                                ))}
                                {/* Fallback if no impact factor history */}
                                {(journal.bioxbio == null || (journal.bioxbio && journal.bioxbio.length === 0)) && (
                                    <tr>
                                        <td className="px-6 py-2" colSpan={2}>No Impact Factor History Available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Right Column: Description */}
                    <div className="">
                        <h2 className="text-2xl font-bold text-secondary mb-4">How Impact Factor is Calculated</h2>
                        <p className="text-lg mb-4">
                            The Impact Factor (IF) is a metric that reflects the yearly average number of citations to
                            recent articles published in a journal.
                            It is calculated based on the following formula:
                        </p>
                        <p className="text-lg font-semibold  p-4 rounded-lg mb-4">
                            <strong>Impact Factor =</strong> <em>Total citations in the current year to articles published
                                in the previous two years</em> / <em>Total number of articles published in the previous two
                                years</em>
                        </p>
                        <p className="text-lg">
                            For example, if a journal has 1,000 citations in 2023 to articles published in 2021 and 2022,
                            and published 200 articles in those two years combined, the IF would be:
                            <strong>1,000 / 200 = 5.0</strong>.
                        </p>
                        <p className="text-lg">
                            This metric, provided by databases like <strong>Scopus</strong> and <strong>Clarivate
                                Analytics</strong>, helps researchers identify influential journals in their field.
                        </p>
                    </div>
                </div>
            </section>

            <section id="h-index" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: H-index Value and Image */}
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-secondary mb-4">H-index</h2>
                        <p className=" text-lg mb-4">
                            The H-index of this journal is <strong className="text-2xl">{journal["H index"] || 'N/A'}</strong>. {/* Use journal["H index"] */}
                        </p>
                        <div className="w-full max-w-xs relative aspect-square"> {/* Container for Image with aspect ratio */}
                            <Image
                                src="/Hindex.png" // Use local image or provide a valid URL
                                alt="H-index Illustration"
                                layout="fill"
                                objectFit="contain" // Use 'contain' to fit image within bounds without cropping
                            />
                        </div>
                    </div>

                    {/* Right Column: Description of H-index */}
                    <div className="">
                        <h2 className="text-2xl font-bold text-secondary mb-4">What is H-index?</h2>
                        <p className="text-lg mb-4">
                            The <strong>H-index</strong> is a metric used to measure the productivity and citation impact of a researcher or journal.
                            It is defined as the maximum value of <em>h</em> such that the entity has published <em>h</em> papers that have each been cited at least <em>h</em> times.
                        </p>
                        <p className="text-lg font-semibold  p-4 rounded-lg mb-4">
                            <strong>Formula:</strong> Identify the largest number <em>h</em> where at least <em>h</em> publications have received at least <em>h</em> citations.
                        </p>
                        <p className="text-lg">
                            For example, if a journal has published 10 papers and each paper has been cited the following number of times:
                            <strong>20, 15, 12, 10, 9, 7, 6, 5, 4, 3</strong>, the H-index is <strong>7</strong>, as the 7th paper has at least 7 citations.
                        </p>
                        <p className="text-lg">
                            The H-index provides a balanced measure of both the quantity (number of publications) and quality (citations) of the output.
                        </p>
                    </div>
                </div>
            </section>

            <section id="sjr" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: SJR Value and Image */}
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-secondary mb-4">SJR (Scimago Journal Ranking)</h2>
                        <p className=" text-lg mb-4">
                            The SJR value of this journal is <strong className="text-2xl">{journal.SJR || 'N/A'}</strong>. {/* Use journal.SJR */}
                        </p>
                        <div className="w-full max-w-xs rounded-lg shadow-lg relative aspect-square"> {/* Container for Image with aspect ratio and styling */}
                            <Image
                                src="/SJRCard.jpg"
                                alt="SJR Illustration"
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    </div>

                    {/* Right Column: Description of SJR */}
                    <div className="">
                        <h2 className="text-2xl font-bold text-secondary mb-4">What is SJR?</h2>
                        <p className="text-lg mb-4">
                            The <strong>Scimago Journal Rank (SJR)</strong> is a prestige metric that ranks journals based on their scientific influence and the quality of citations they receive.
                            It is developed from the information in the Scopus database.
                        </p>
                        <p className="text-lg font-semibold  p-4 rounded-lg mb-4">
                            <strong>Formula:</strong> SJR is calculated based on the weighted citations received in a given year. The weights are determined by the prestige of the citing journal.
                        </p>
                        <p className="text-lg">
                            For example, a journal that receives citations from highly ranked journals will have a higher SJR compared to journals with similar citation counts from less influential sources.
                        </p>
                        <p className="text-lg">
                            SJR takes into account both the number of citations and the importance of the citing journals, offering a balanced perspective on the scientific impact of a journal.
                        </p>
                    </div>
                </div>
            </section>

            <section id="subject-area-category" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Subject Area and Category</h2>
                <div className=" text-lg">
                    {/* Display Subject Areas and Categories from journal data */}
                    {journal["Subject Area and Category"] ? (
                        <>
                            <p className="mb-2"><strong>Field of Research: </strong> {journal["Subject Area and Category"]["Field of Research"]}</p>
                            <p><strong>Categories: </strong>
                            {journal["Subject Area and Category"].Topics.map((topic, index) => (
                                <span key={index}>
                                    {topic}{index < journal["Subject Area and Category"].Topics.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                            </p>
                        </>
                    ) : "No Subject Areas/Categories Available"}
                </div>
            </section>
        </div>
    );
};