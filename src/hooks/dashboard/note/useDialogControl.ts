// useDialogControl.ts
import { useState } from 'react';

const useDialogControl = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const openDialogForDay = (year: number, month: number, day: number) => {
        setSelectedDate(new Date(year, month, day));
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedDate(null);
    };

    return { isDialogOpen, selectedDate, openDialogForDay, closeDialog, setSelectedDate }; // Return setSelectedDate
};

export default useDialogControl;