'use client';

import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ColDef, GridReadyEvent, ICellRendererParams, ModuleRegistry, IRowNode, RowSelectionModule } from 'ag-grid-community';
import { useCallback, useEffect, useRef, useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useFieldArray, Control, UseFormWatch } from 'react-hook-form';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';

ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

export enum ConferenceDateType {
  CONFERENCE_DATE = 'conferenceDates',
  CAMERA_READY_DATE = 'cameraReadyDate',
  NOTIFICATION_DATE = 'notificationDate',
  SUBMISSION_DATE = 'submissionDate',
  REGISTRATION_DATE = 'registrationDate',
  OTHER_DATE = 'otherDate'
}

export interface ConferenceDate {
  id: string;
  type: ConferenceDateType | null;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface DatesTableProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  name: string;
  onRefetch?: () => Promise<void>;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

export interface DatesTableRef {
  validateBeforeSubmit: () => boolean;
  validateCurrentData: (data: ConferenceDate[]) => boolean;
}

interface DateRow extends ConferenceDate {}

const DatesTable = forwardRef<DatesTableRef, DatesTableProps>(function DatesTable({ control, watch, name, onRefetch, onValidationChange }, ref) {
  const gridRef = useRef<AgGridReact>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name
  });

  // Validation function for date relationships
  const validateDateRelationships = useCallback((updatedFields: ConferenceDate[], showToasts = false) => {
    console.log('🔍 DatesTable: validateDateRelationships called', { 
      fieldsCount: updatedFields.length, 
      showToasts,
      fields: updatedFields 
    });
    
    const errors: string[] = [];
    
    // First, validate that all date types are valid enum values
    updatedFields.forEach(date => {
      if (date.type && !Object.values(ConferenceDateType).includes(date.type as ConferenceDateType)) {
        errors.push(`Invalid date type: ${date.type}. Please select a valid date type.`);
        console.log('❌ Invalid date type found:', { dateType: date.type, validTypes: Object.values(ConferenceDateType) });
      }
    });
    
    // Helper function to find date by type
    const findDateByType = (type: ConferenceDateType) => 
      updatedFields.find(date => date.type === type);
    
    // Get important dates
    const submissionDate = findDateByType(ConferenceDateType.SUBMISSION_DATE);
    const notificationDate = findDateByType(ConferenceDateType.NOTIFICATION_DATE);
    const cameraReadyDate = findDateByType(ConferenceDateType.CAMERA_READY_DATE);
    const conferenceDate = findDateByType(ConferenceDateType.CONFERENCE_DATE);
    const registrationDate = findDateByType(ConferenceDateType.REGISTRATION_DATE);
    
    console.log('📅 Found dates:', {
      submissionDate: (submissionDate?.startDate || 'null') + ' - ' + (submissionDate?.endDate || 'null'),
      notificationDate: (notificationDate?.startDate || 'null') + ' - ' + (notificationDate?.endDate || 'null'),
      cameraReadyDate: (cameraReadyDate?.startDate || 'null') + ' - ' + (cameraReadyDate?.endDate || 'null'),
      conferenceDate: (conferenceDate?.startDate || 'null') + ' - ' + (conferenceDate?.endDate || 'null'),
      registrationDate: (registrationDate?.startDate || 'null') + ' - ' + (registrationDate?.endDate || 'null'),
    });
    
    // Validate individual row start/end dates
    updatedFields.forEach(date => {
      if (date.startDate && date.endDate) {
        // Ensure we're working with properly formatted date strings
        const startDateStr = typeof date.startDate === 'string' 
          ? date.startDate 
          : dayjs(date.startDate).format('YYYY-MM-DD');
        const endDateStr = typeof date.endDate === 'string' 
          ? date.endDate 
          : dayjs(date.endDate).format('YYYY-MM-DD');
          
        console.log('🗓️ Comparing dates for', date.name || date.type, { 
          start: startDateStr, 
          end: endDateStr,
          isAfter: dayjs(startDateStr).isAfter(dayjs(endDateStr))
        });
        
        if (dayjs(startDateStr).isAfter(dayjs(endDateStr))) {
          errors.push(`Start date must be before or equal to end date for ${date.name || date.type}`);
        }
      }
    });
    
    // Helper function to safely format dates
    const formatDate = (date: string | Date | null | undefined) => {
      if (!date) return null;
      return typeof date === 'string' ? date : dayjs(date).format('YYYY-MM-DD');
    };
    
    // Validate submission -> notification
    const submissionEndDate = formatDate(submissionDate?.endDate);
    const notificationStartDate = formatDate(notificationDate?.startDate);
    if (submissionEndDate && notificationStartDate) {
      if (dayjs(submissionEndDate).isAfter(dayjs(notificationStartDate))) {
        errors.push('Submission deadline must be before notification date');
      }
    }
    
    // Validate notification -> camera ready
    const notificationEndDate = formatDate(notificationDate?.endDate);
    const cameraReadyStartDate = formatDate(cameraReadyDate?.startDate);
    if (notificationEndDate && cameraReadyStartDate) {
      if (dayjs(notificationEndDate).isAfter(dayjs(cameraReadyStartDate))) {
        errors.push('Notification date must be before camera ready deadline');
      }
    }
    
    // Validate camera ready -> conference
    const cameraReadyEndDate = formatDate(cameraReadyDate?.endDate);
    const conferenceStartDate = formatDate(conferenceDate?.startDate);
    if (cameraReadyEndDate && conferenceStartDate) {
      if (dayjs(cameraReadyEndDate).isAfter(dayjs(conferenceStartDate))) {
        errors.push('Camera ready deadline must be before conference date');
      }
    }
    
    // Validate registration -> conference
    const registrationEndDate = formatDate(registrationDate?.endDate);
    if (registrationEndDate && conferenceStartDate) {
      if (dayjs(registrationEndDate).isAfter(dayjs(conferenceStartDate))) {
        errors.push('Registration deadline must be before conference date');
      }
    }
    
    console.log('🔍 Validation result:', { errorsCount: errors.length, errors });
    
    // Update validation state and notify parent
    setValidationErrors(errors);
    if (onValidationChange) {
      console.log('📞 Calling onValidationChange with:', { isValid: errors.length === 0, errors });
      onValidationChange(errors.length === 0, errors);
    }
    
    // Only show toast messages when explicitly requested and user has interacted
    if (showToasts && hasInteracted && errors.length > 0) {
      console.log('🍞 Showing toast errors:', errors);
      // Show only the first error to avoid spam
      toast.error(errors[0]);
    }
    
    return errors;
  }, [onValidationChange, hasInteracted]);

  // Optimize cell value changes to prevent unnecessary re-renders
  const handleCellValueChanged = useCallback((params: any, fieldName: string) => {
    console.log('📝 DatesTable: Cell value changed', { fieldName, newValue: params.newValue, data: params.data });
    setHasInteracted(true);
    const index = fields.findIndex(field => field.id === params.data.id);
    if (index !== -1) {
      let processedValue = params.newValue;
      
      // Handle date fields - convert Date objects to YYYY-MM-DD strings
      if ((fieldName === 'startDate' || fieldName === 'endDate') && processedValue) {
        if (processedValue instanceof Date) {
          processedValue = dayjs(processedValue).format('YYYY-MM-DD');
        } else if (typeof processedValue === 'string') {
          // Try to parse and format the string
          processedValue = dayjs(processedValue).format('YYYY-MM-DD');
        }
        console.log('📅 DatesTable: Processed date value', { original: params.newValue, processed: processedValue });
      }
      
      const updatedData = { ...params.data, [fieldName]: processedValue || null };
      const newFields = [...fields] as ConferenceDate[];
      newFields[index] = updatedData as ConferenceDate;
      
      console.log('🔄 DatesTable: Updated fields for validation', newFields[index]);
      
      // Update the form state first
      update(index, updatedData);
      
      // Then validate with a small delay to ensure state is updated
      setTimeout(() => {
        console.log('🔄 DatesTable: Validating after cell change (delayed)');
        const validationErrors = validateDateRelationships(newFields, true);
      }, 50);
    }
  }, [fields, update, validateDateRelationships]);

  // Handle blur event for validation
  const handleCellEditingStopped = useCallback((params: any) => {
    console.log('👋 DatesTable: Cell editing stopped (blur)', { hasInteracted, paramsData: params.data });
    if (hasInteracted) {
      // Use a small timeout to ensure the form state has been updated
      setTimeout(() => {
        console.log('🔄 DatesTable: Validating on blur (after timeout)');
        const validationErrors = validateDateRelationships(fields as ConferenceDate[], false); // Don't show toasts on blur
      }, 100);
    }
  }, [fields, validateDateRelationships, hasInteracted]);

  // Expose validation function for parent component to use before submit
  useImperativeHandle(ref, () => ({
    validateBeforeSubmit: () => {
      console.log('🚀 DatesTable: validateBeforeSubmit called from parent');
      console.log('🚀 DatesTable: Current fields state:', fields);
      
      // Get the most current field data from the form
      const currentFormData = watch('dates') as ConferenceDate[];
      console.log('🚀 DatesTable: Current form data from watch:', currentFormData);
      
      // Use the more recent data (form data vs component state)
      const dataToValidate = currentFormData && currentFormData.length > 0 ? currentFormData : fields;
      console.log('🚀 DatesTable: Data being validated:', dataToValidate);
      
      const errors = validateDateRelationships(dataToValidate as ConferenceDate[], true);
      const isValid = errors.length === 0;
      console.log('✅ DatesTable: validateBeforeSubmit result:', { isValid, errorsCount: errors.length });
      return isValid;
    },
    validateCurrentData: (data: ConferenceDate[]) => {
      console.log('🚀 DatesTable: validateCurrentData called with:', data);
      const errors = validateDateRelationships(data, true);
      const isValid = errors.length === 0;
      console.log('✅ DatesTable: validateCurrentData result:', { isValid, errorsCount: errors.length });
      return isValid;
    }
  }), [fields, validateDateRelationships, watch]);

  // Memoize row data to prevent unnecessary re-renders
  const rowData = useMemo(() => fields, [fields]);

  // Validate all dates when fields change
  useEffect(() => {
    console.log('🔄 DatesTable: useEffect fields changed', { fieldsLength: fields.length, hasInteracted });
    if (fields.length > 0) {
      const validationErrors = validateDateRelationships(fields as ConferenceDate[], false); // Don't show toasts in useEffect
    } else {
      // No dates means no validation errors
      console.log('📭 DatesTable: No dates, clearing errors');
      setValidationErrors([]);
      if (onValidationChange) {
        onValidationChange(true, []);
      }
    }
  }, [fields, validateDateRelationships, onValidationChange, hasInteracted]);

  const handleCancel = async () => {
    if (onRefetch) {
      try {
        setIsLoading(true);
        await onRefetch();
      } catch (error) {
        console.error('Error refetching data:', error);
        toast.error('Error fetching data');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveDate = useCallback((index: number) => {
    setHasInteracted(true);
    remove(index);
    
    // Validate after removing
    const newFields = fields.filter((_, i) => i !== index) as ConferenceDate[];
    const validationErrors = validateDateRelationships(newFields, true);
  }, [fields, remove, validateDateRelationships]);

  const handleAddDate = () => {
    setHasInteracted(true);
    const newDate = {
      id: crypto.randomUUID(),
      type: null,
      name: null,
      startDate: null,
      endDate: null
    };
    append(newDate);
    
    // Validate after adding (though new date shouldn't cause issues, better to be safe)
    const newFields = [...fields, newDate] as ConferenceDate[];
    const validationErrors = validateDateRelationships(newFields, false);
  };

  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'type',
      headerName: 'Date Type',
      editable: true,
      flex: 1,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: Object.values(ConferenceDateType)
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return params.value;
      },
      onCellValueChanged: (params) => {
        handleCellValueChanged(params, 'type');
      }
    },
    {
      field: 'name',
      headerName: 'Date Name',
      editable: true,
      flex: 1,
      cellEditor: 'agTextCellEditor',
      cellEditorParams: {
        maxLength: 100
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return params.value;
      },
      onCellValueChanged: (params) => {
        handleCellValueChanged(params, 'name');
      }
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      editable: true,
      flex: 1,
      cellEditor: 'agDateCellEditor',
      cellEditorParams: {
        browserDatePicker: true
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return dayjs(params.value).format('YYYY-MM-DD');
      },
      valueParser: (params) => {
        if (!params.newValue) return null;
        return dayjs(params.newValue).format('YYYY-MM-DD');
      },
      onCellValueChanged: (params) => {
        handleCellValueChanged(params, 'startDate');
      }
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      editable: true,
      flex: 1,
      cellEditor: 'agDateCellEditor',
      cellEditorParams: {
        browserDatePicker: true
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return dayjs(params.value).format('YYYY-MM-DD');
      },
      valueParser: (params) => {
        if (!params.newValue) return null;
        return dayjs(params.newValue).format('YYYY-MM-DD');
      },
      onCellValueChanged: (params) => {
        handleCellValueChanged(params, 'endDate');
      }
    },
    {
      headerName: 'Remove',
      width: 100,
      cellRenderer: (params: ICellRendererParams) => {
        const index = fields.findIndex(field => field.id === params.data.id);
        if (index === -1) return null;
        return (
          <button
            type="button"
            onClick={() => handleRemoveDate(index)}
            className="text-red-600 hover:text-red-900"
          >
            Remove
          </button>
        );
      },
    },
  ], [fields, handleRemoveDate, handleCellValueChanged]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Dates</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-5  rounded hover:bg-gray-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleAddDate}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Date
          </button>
        </div>
      </div>
      
      {/* Validation Errors Display */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Date Validation Errors
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul role="list" className="list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="ag-theme-alpine w-full" style={{ height: 400 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows={false}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          suppressScrollOnNewData={true}
          maintainColumnOrder={true}
          suppressColumnMoveAnimation={true}
          getRowId={(params) => params.data.id}
          onCellEditingStopped={handleCellEditingStopped}
        />
      </div>
    </div>
  );
});

export default DatesTable; 