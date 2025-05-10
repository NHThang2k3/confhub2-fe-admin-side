// src/hooks/useSelection.ts
import { useState, useCallback, useEffect, useMemo } from 'react';

const useSelection = (itemIds: string[]) => {
    const [checkedIndices, setCheckedIndices] = useState<string[]>([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    // Memoize để tránh thay đổi reference khi itemIds giống nhau
    const itemIdsStable = useMemo(() => itemIds, [JSON.stringify(itemIds)]); // <-- Fix here

    const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
        setCheckedIndices(prevIndices => {
            if (checked) {
                return [...prevIndices, id];
            } else {
                return prevIndices.filter(i => i !== id);
            }
        });
    }, []);

    const handleSelectAllChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const checked = event.target.checked;
            setSelectAllChecked(checked);
            setCheckedIndices(checked ? [...itemIdsStable] : []); // <-- Dùng itemIds đã memoize
        },
        [itemIdsStable] // <-- Dependency ổn định
    );

    // Effect điều chỉnh checkedIndices khi itemIds thay đổi
    useEffect(() => {
        setCheckedIndices(prev => 
            prev.filter(id => itemIdsStable.includes(id)))
        setSelectAllChecked(prev => 
            prev && checkedIndices.length === itemIdsStable.length
        );
    }, [itemIdsStable]); // <-- Chỉ chạy khi itemIds thực sự thay đổi

    return { 
        checkedIndices, 
        setCheckedIndices, 
        selectAllChecked, 
        handleCheckboxChange, 
        handleSelectAllChange 
    };
};

export default useSelection;