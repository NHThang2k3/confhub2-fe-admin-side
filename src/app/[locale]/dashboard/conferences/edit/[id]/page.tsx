'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { useForm, useFieldArray, Controller, ControllerRenderProps, FieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DATA_API_URL } from '@/src/config';

interface Location {
  address: string;
  cityStateProvince: string;
  country: string;
  continent: string;
}

interface ConferenceDate {
  type: string;
  startDate: string;
  endDate: string;
  name: string;
}

const locationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  cityStateProvince: z.string().min(1, 'City/State/Province is required'),
  country: z.string().min(1, 'Country is required'),
  continent: z.string().min(1, 'Continent is required'),
});

const dateSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  name: z.string().min(1, 'Name is required'),
});

const formSchema = z.object({
  year: z.number().min(1900).max(2100),
  accessType: z.enum(['Online', 'Offline', 'Hybrid']),
  isAvailable: z.boolean(),
  publisher: z.string().min(1, 'Publisher is required'),
  summerize: z.string().min(1, 'Summary is required'),
  callForPaper: z.string().min(1, 'Call for papers is required'),
  link: z.string().url('Must be a valid URL'),
  cfpLink: z.string().url('Must be a valid URL').optional(),
  impLink: z.string().url('Must be a valid URL').optional(),
  locations: z.array(locationSchema).min(1, 'At least one location is required'),
  topics: z.array(z.string()).min(1, 'At least one topic is required'),
  dates: z.array(dateSchema).min(1, 'At least one date is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function EditConferenceHistory({ params }: { params: { id: string } }) {
  const t = useTranslations('conferencesPage');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
      locations: [{ address: '', cityStateProvince: '', country: '', continent: '' }],
      topics: [''],
      dates: [{ type: '', startDate: '', endDate: '', name: '' }],
    },
  });

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({
    control,
    name: 'locations',
  });

  const { fields: topicFields, append: appendTopic, remove: removeTopic } = useFieldArray<FormData>({
    control,
    name: 'topics' as const,
  });

  const { fields: dateFields, append: appendDate, remove: removeDate } = useFieldArray({
    control,
    name: 'dates',
  });

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await axios.get(`${DATA_API_URL}/api/v1/admin/conferences/history/${params.id}`);
        reset(response.data);
      } catch (error) {
        console.error('Error fetching organization data:', error);
      }
    };

    fetchOrganizationData();
  }, [params.id, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await axios.put(
        `${DATA_API_URL}/api/v1/admin/conferences/update-history`,
        {
          conferenceId: params.id,
          ...data,
        }
      );
      router.refresh();
      router.push('/dashboard/conferences');
    } catch (error) {
      console.error('Error updating conference history:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('modal.editForm.title')}</h1>
        <button
          onClick={() => router.push('/en/dashboard/conferences')}
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          {t('modal.editForm.cancel')}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('modal.editForm.year')}</label>
            <Controller
              name="year"
              control={control}
              render={({ field }: { field: ControllerRenderProps<FormData, 'year'> }) => (
                <input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
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
              render={({ field }: { field: ControllerRenderProps<FormData, 'accessType'> }) => (
                <select {...field} className="w-full px-3 py-2 border rounded-md">
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              )}
            />
            {errors.accessType && <p className="text-red-500 text-sm mt-1">{errors.accessType.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('modal.editForm.publisher')}</label>
          <Controller
            name="publisher"
            control={control}
            render={({ field }: { field: ControllerRenderProps<FormData, 'publisher'> }) => (
              <input {...field} className="w-full px-3 py-2 border rounded-md" />
            )}
          />
          {errors.publisher && <p className="text-red-500 text-sm mt-1">{errors.publisher.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('modal.editForm.summary')}</label>
          <Controller
            name="summerize"
            control={control}
            render={({ field }: { field: ControllerRenderProps<FormData, 'summerize'> }) => (
              <textarea {...field} className="w-full px-3 py-2 border rounded-md" rows={3} />
            )}
          />
          {errors.summerize && <p className="text-red-500 text-sm mt-1">{errors.summerize.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('modal.editForm.callForPaper')}</label>
          <Controller
            name="callForPaper"
            control={control}
            render={({ field }: { field: ControllerRenderProps<FormData, 'callForPaper'> }) => (
              <textarea {...field} className="w-full px-3 py-2 border rounded-md" rows={3} />
            )}
          />
          {errors.callForPaper && <p className="text-red-500 text-sm mt-1">{errors.callForPaper.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('modal.editForm.mainLink')}</label>
            <Controller
              name="link"
              control={control}
              render={({ field }: { field: ControllerRenderProps<FormData, 'link'> }) => (
                <input type="url" {...field} className="w-full px-3 py-2 border rounded-md" />
              )}
            />
            {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('modal.editForm.cfpLink')}</label>
            <Controller
              name="cfpLink"
              control={control}
              render={({ field }: { field: ControllerRenderProps<FormData, 'cfpLink'> }) => (
                <input type="url" {...field} className="w-full px-3 py-2 border rounded-md" />
              )}
            />
            {errors.cfpLink && <p className="text-red-500 text-sm mt-1">{errors.cfpLink.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('modal.editForm.importantLink')}</label>
            <Controller
              name="impLink"
              control={control}
              render={({ field }: { field: ControllerRenderProps<FormData, 'impLink'> }) => (
                <input type="url" {...field} className="w-full px-3 py-2 border rounded-md" />
              )}
            />
            {errors.impLink && <p className="text-red-500 text-sm mt-1">{errors.impLink.message}</p>}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">{t('modal.editForm.locations')}</label>
            <button
              type="button"
              onClick={() => appendLocation({ address: '', cityStateProvince: '', country: '', continent: '' })}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t('modal.editForm.addLocation')}
            </button>
          </div>
          {locationFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-2 gap-4 mb-2">
              <Controller
                name={`locations.${index}.address`}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FormData, `locations.${number}.address`> }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.address')}
                    className="px-3 py-2 border rounded-md"
                  />
                )}
              />
              <Controller
                name={`locations.${index}.cityStateProvince`}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FormData, `locations.${number}.cityStateProvince`> }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.cityStateProvince')}
                    className="px-3 py-2 border rounded-md"
                  />
                )}
              />
              <Controller
                name={`locations.${index}.country`}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FormData, `locations.${number}.country`> }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.country')}
                    className="px-3 py-2 border rounded-md"
                  />
                )}
              />
              <Controller
                name={`locations.${index}.continent`}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FormData, `locations.${number}.continent`> }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.continent')}
                    className="px-3 py-2 border rounded-md"
                  />
                )}
              />
              {index > 0 && (
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

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">{t('modal.editForm.topics')}</label>
            <button
              type="button"
              onClick={() => appendTopic('' as const)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t('modal.editForm.addTopic')}
            </button>
          </div>
          {topicFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <Controller
                name={`topics.${index}`}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FormData, `topics.${number}`> }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.topicPlaceholder')}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                )}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeTopic(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  {t('modal.editForm.remove')}
                </button>
              )}
            </div>
          ))}
          {errors.topics && <p className="text-red-500 text-sm mt-1">{errors.topics.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">{t('modal.editForm.dates')}</label>
            <button
              type="button"
              onClick={() => appendDate({ type: '', startDate: '', endDate: '', name: '' })}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t('modal.editForm.addDate')}
            </button>
          </div>
          {dateFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-4 gap-4 mb-2">
              <Controller
                name={`dates.${index}.type`}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FormData, `dates.${number}.type`> }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.dateType')}
                    className="px-3 py-2 border rounded-md"
                  />
                )}
              />
              <Controller
                name={`dates.${index}.name`}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FormData, `dates.${number}.name`> }) => (
                  <input
                    {...field}
                    placeholder={t('modal.editForm.dateName')}
                    className="px-3 py-2 border rounded-md bg-gray-50"
                  />
                )}
              />
              <Controller
                name={`dates.${index}.startDate`}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FormData, `dates.${number}.startDate`> }) => (
                  <input
                    type="date"
                    {...field}
                    className="px-3 py-2 border rounded-md"
                  />
                )}
              />
              <Controller
                name={`dates.${index}.endDate`}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FormData, `dates.${number}.endDate`> }) => (
                  <input
                    type="date"
                    {...field}
                    className="px-3 py-2 border rounded-md"
                  />
                )}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeDate(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  {t('modal.editForm.remove')}
                </button>
              )}
            </div>
          ))}
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