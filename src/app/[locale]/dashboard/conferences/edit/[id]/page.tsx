'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { useForm, useFieldArray, Controller, ControllerRenderProps, FieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DATA_API_URL } from '@/src/config';
import { toast, Toaster } from 'react-hot-toast';
import TopicsTable from '../components/TopicsTable';
import DatesTable from '../components/DatesTable';

interface Location {
  address?: string;
  cityStateProvince?: string;
  country?: string;
  continent?: string;
}

interface ConferenceDate {
  type?: string;
  startDate?: string;
  endDate?: string;
  name?: string;
}

interface FormValues {
  year?: number;
  accessType?: 'Online' | 'Offline' | 'Hybrid';
  isAvailable?: boolean;
  publisher?: string;
  summerize?: string;
  callForPaper?: string;
  link?: string;
  cfpLink?: string;
  impLink?: string;
  locations?: Location[];
  topics?: string[];
  dates?: ConferenceDate[];
}

interface EditMode {
  basicInfo: boolean;
  links: boolean;
  locations: boolean;
}

const locationSchema = z.object({
  address: z.string().optional(),
  cityStateProvince: z.string().optional(),
  country: z.string().optional(),
  continent: z.string().optional(),
});

const dateSchema = z.object({
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  name: z.string().optional(),
});

const formSchema = z.object({
  year: z.number().min(1900).max(2100).optional(),
  accessType: z.enum(['Online', 'Offline', 'Hybrid']).default('Offline'),
  isAvailable: z.boolean().optional(),
  publisher: z.string().optional(),
  summerize: z.string().optional(),
  callForPaper: z.string().optional(),
  link: z.string().url('Must be a valid URL').optional(),
  cfpLink: z.string().url('Must be a valid URL').optional(),
  impLink: z.string().url('Must be a valid URL').optional(),
  locations: z.array(locationSchema).optional(),
  topics: z.array(z.string()).optional(),
  dates: z.array(dateSchema).optional(),
});

export default function EditConferenceHistory({ params }: { params: { id: string } }) {
  const t = useTranslations('conferencesPage');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>({
    basicInfo: false,
    links: false,
    locations: false,
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: async (data) => {
      try {
        // Create a new object with only the fields that are in edit mode
        const dataToValidate: Partial<FormValues> = {};
        
        if (editMode.basicInfo) {
          dataToValidate.year = data.year;
          dataToValidate.accessType = data.accessType || 'Offline'; // Set default if empty
          dataToValidate.publisher = data.publisher;
          dataToValidate.summerize = data.summerize;
          dataToValidate.callForPaper = data.callForPaper;
        }
        
        if (editMode.links) {
          dataToValidate.link = data.link;
          dataToValidate.cfpLink = data.cfpLink;
          dataToValidate.impLink = data.impLink;
        }
        
        if (editMode.locations) {
          dataToValidate.locations = data.locations;
        }
        
        // Always include topics and dates
        dataToValidate.topics = data.topics;
        dataToValidate.dates = data.dates;

        // Validate only the fields that are in edit mode
        const result = await formSchema.safeParseAsync(dataToValidate);
        
        if (result.success) {
          return { values: data, errors: {} };
        } else {
          return {
            values: {},
            errors: result.error.flatten().fieldErrors,
          };
        }
      } catch (error) {
        return {
          values: {},
          errors: {},
        };
      }
    },
    defaultValues: {
      year: new Date().getFullYear(),
      accessType: 'Offline',
      isAvailable: true,
      publisher: '',
      summerize: '',
      callForPaper: '',
      link: '',
      cfpLink: '',
      impLink: '',
      locations: [],
      topics: [],
      dates: [],
    },
  });

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray<FormValues>({
    control,
    name: 'locations',
  });

  const { fields: dateFields, append: appendDate, remove: removeDate } = useFieldArray<FormValues>({
    control,
    name: 'dates',
  });

  // Watch topics field for changes
  const topics = watch('topics') || [];

  // Watch dates field for changes
  const dates = watch('dates') || [];

  const fetchConferenceData = async () => {
    try {
      const response = await axios.get(`${DATA_API_URL}/api/v1/admin/conferences/history/${params.id}`);
      const data = response.data;
      // Ensure topics is always an array
      if (data.topics && Array.isArray(data.topics)) {
        reset({
          ...data,
          topics: data.topics,
        });
      } else {
        reset({
          ...data,
          topics: [''],
        });
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
      toast.error(t('modal.editForm.fetchError'));
    }
  };

  useEffect(() => {
    fetchConferenceData();
  }, [params.id]);

  const handleTopicsChange = (newTopics: string[]) => {
    // Update the form state directly using setValue
    setValue('topics', newTopics, { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  const handleDatesChange = (newDates: ConferenceDate[]) => {
    // Update the form state directly using setValue
    setValue('dates', newDates, { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  const toggleEditMode = (group: keyof EditMode) => {
    setEditMode(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      // Only include fields that are in edit mode
      const updatedData: Partial<FormValues> = {};
      
      if (editMode.basicInfo) {
        updatedData.year = data.year;
        updatedData.accessType = data.accessType;
        updatedData.publisher = data.publisher;
        updatedData.summerize = data.summerize;
        updatedData.callForPaper = data.callForPaper;
      }
      
      if (editMode.links) {
        updatedData.link = data.link;
        updatedData.cfpLink = data.cfpLink;
        updatedData.impLink = data.impLink;
      }
      
      if (editMode.locations) {
        updatedData.locations = data.locations;
      }
      
      // Always include topics and dates
      updatedData.topics = data.topics;
      updatedData.dates = data.dates;

      const response = await axios.put(
        `${DATA_API_URL}/api/v1/admin/conferences/update-history`,
        {
          conferenceId: params.id,
          ...updatedData,
        }
      );
      
      reset(response.data);
      router.refresh();
      
      toast.success('Conference updated successfully!', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#4CAF50',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
      
      await fetchConferenceData();
    } catch (error) {
      console.error('Error updating conference history:', error);
      toast.error('Failed to update conference. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#F44336',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('modal.editForm.title')}</h1>
        <button
          onClick={() => router.push('/en/dashboard/conferences')}
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          {t('modal.editForm.cancel')}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Group */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <button
              type="button"
              onClick={() => toggleEditMode('basicInfo')}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editMode.basicInfo ? 'Cancel Edit' : 'Edit'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('modal.editForm.year')}</label>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!editMode.basicInfo}
                  />
                )}
              />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('modal.editForm.accessType')}</label>
              <Controller
                name="accessType"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.basicInfo}>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                )}
              />
              {errors.accessType && <p className="text-red-500 text-sm mt-1">{errors.accessType.message}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">{t('modal.editForm.publisher')}</label>
            <Controller
              name="publisher"
              control={control}
              render={({ field }) => (
                <input {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.basicInfo} />
              )}
            />
            {errors.publisher && <p className="text-red-500 text-sm mt-1">{errors.publisher.message}</p>}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">{t('modal.editForm.summary')}</label>
            <Controller
              name="summerize"
              control={control}
              render={({ field }) => (
                <textarea {...field} className="w-full px-3 py-2 border rounded-md" rows={3} disabled={!editMode.basicInfo} />
              )}
            />
            {errors.summerize && <p className="text-red-500 text-sm mt-1">{errors.summerize.message}</p>}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">{t('modal.editForm.callForPaper')}</label>
            <Controller
              name="callForPaper"
              control={control}
              render={({ field }) => (
                <textarea {...field} className="w-full px-3 py-2 border rounded-md" rows={3} disabled={!editMode.basicInfo} />
              )}
            />
            {errors.callForPaper && <p className="text-red-500 text-sm mt-1">{errors.callForPaper.message}</p>}
          </div>
        </div>

        {/* Links Group */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Links</h2>
            <button
              type="button"
              onClick={() => toggleEditMode('links')}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editMode.links ? 'Cancel Edit' : 'Edit'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('modal.editForm.mainLink')}</label>
              <Controller
                name="link"
                control={control}
                render={({ field }) => (
                  <input type="url" {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.links} />
                )}
              />
              {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('modal.editForm.cfpLink')}</label>
              <Controller
                name="cfpLink"
                control={control}
                render={({ field }) => (
                  <input type="url" {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.links} />
                )}
              />
              {errors.cfpLink && <p className="text-red-500 text-sm mt-1">{errors.cfpLink.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('modal.editForm.importantLink')}</label>
              <Controller
                name="impLink"
                control={control}
                render={({ field }) => (
                  <input type="url" {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.links} />
                )}
              />
              {errors.impLink && <p className="text-red-500 text-sm mt-1">{errors.impLink.message}</p>}
            </div>
          </div>
        </div>

        {/* Locations Group */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t('modal.editForm.locations')}</h2>
            <button
              type="button"
              onClick={() => toggleEditMode('locations')}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editMode.locations ? 'Cancel Edit' : 'Edit'}
            </button>
          </div>
          {editMode.locations && (
            <button
              type="button"
              onClick={() => appendLocation({ address: '', cityStateProvince: '', country: '', continent: '' })}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
            >
              {t('modal.editForm.addLocation')}
            </button>
          )}
          {locationFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-2 gap-4 mb-2">
              <Controller
                name={`locations.${index}.address`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.address')}
                    className="px-3 py-2 border rounded-md"
                    disabled={!editMode.locations}
                  />
                )}
              />
              <Controller
                name={`locations.${index}.cityStateProvince`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.cityStateProvince')}
                    className="px-3 py-2 border rounded-md"
                    disabled={!editMode.locations}
                  />
                )}
              />
              <Controller
                name={`locations.${index}.country`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.country')}
                    className="px-3 py-2 border rounded-md"
                    disabled={!editMode.locations}
                  />
                )}
              />
              <Controller
                name={`locations.${index}.continent`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.continent')}
                    className="px-3 py-2 border rounded-md"
                    disabled={!editMode.locations}
                  />
                )}
              />
              {editMode.locations && index > 0 && (
                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  {t('modal.editForm.remove')}
                </button>
              )}
            </div>
          ))}
          {errors.locations && <p className="text-red-500 text-sm mt-1">{errors.locations.message}</p>}
        </div>

        {/* Topics Group - Always Editable */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">{t('modal.editForm.topics')}</h2>
          <TopicsTable
            topics={topics}
            onTopicsChange={handleTopicsChange}
          />
          {errors.topics && <p className="text-red-500 text-sm mt-1">{errors.topics.message}</p>}
        </div>

        {/* Dates Group - Always Editable */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">{t('modal.editForm.dates')}</h2>
          <DatesTable
            dates={dates}
            onDatesChange={handleDatesChange}
          />
          {errors.dates && <p className="text-red-500 text-sm mt-1">{errors.dates.message}</p>}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard/conferences')}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            {t('modal.editForm.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? t('modal.editForm.saving') : t('modal.editForm.save')}
          </button>
        </div>
      </form>
    </div>
  );
} 