// useDateNavigation.ts
import { useState } from 'react';

const useDateNavigation = (initialDate: Date = new Date()) => {
    const [currentDate, setCurrentDate] = useState(initialDate);

    const goToPreviousMonth = () => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
    };

    const goToPreviousDay = () => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() - 1));
    };

    const goToNextDay = () => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1));
    };

    const goToPreviousWeek = () => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() - 7));
    };

    const goToNextWeek = () => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 7));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };
    // Get Week Number
    const getWeek = (date: Date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000; // 86400000 milliseconds in a day
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

  // Helper function to get days in the month of a specific date
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    // Helper function to get the first day of the week of a specific date
    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    return {
        currentDate,
        setCurrentDate,
        goToPreviousMonth,
        goToNextMonth,
        goToPreviousDay,
        goToNextDay,
        goToPreviousWeek,
        goToNextWeek,
        goToToday,
        getWeek,
        getDaysInMonth,
        getFirstDayOfMonth
    };
};

export default useDateNavigation;