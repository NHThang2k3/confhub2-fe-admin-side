'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Sử dụng hook dịch thuật
import axios from 'axios';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DATA_API_URL } from '@/src/config';
import { toast, Toaster } from 'react-hot-toast';
import TopicsTable from '../components/TopicsTable';
import DatesTable from '../components/DatesTable';
import { Link } from '@/src/navigation';
import { ConferenceDateType, ConferenceDate } from '../components/DatesTable';
import dayjs from 'dayjs';
// import { Link } from 'lucide-react';


interface Location {
  address?: string;
  cityStateProvince?: string;
  country?: string;
  continent?: string;
}

interface FormValues {
  year?: number;
  accessType?: 'Online' | 'Offline' | 'Hybrid';
  isAvailable?: boolean; // Chưa được sử dụng trong form hiện tại, nhưng giữ lại trong interface
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
  startDate: z.string().optional(), // Có thể cần validate format ngày tháng
  endDate: z.string().optional(),   // Có thể cần validate format ngày tháng
  name: z.string().optional(),
});

const formSchema = z.object({
  year: z.number().min(1900).max(2100).optional().nullable(),
  accessType: z.enum(['Online', 'Offline', 'Hybrid']).default('Offline').optional().nullable(),
  isAvailable: z.boolean().optional().nullable(),
  publisher: z.string().optional().nullable(),
  summerize: z.string().optional().nullable(),
  callForPaper: z.string().optional().nullable(),
  link: z.string().url('Must be a valid URL').optional().nullable(),
  cfpLink: z.string().url('Must be a valid URL').optional().nullable(),
  impLink: z.string().url('Must be a valid URL').optional().nullable(),
  locations: z.array(locationSchema).optional().nullable(),
  topics: z.array(z.string()).optional().nullable(),
  dates: z.array(z.object({
    type: z.nativeEnum(ConferenceDateType).optional().nullable(),
    name: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable()
  })).optional().nullable(),
});

export default function EditConferenceHistory({ params }: { params: { id: string, locale: string } }) {
  const t = useTranslations('conferencesPage'); // Sử dụng namespace 'conferencesPage'
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
  } = useForm<FormValues>({
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
  console.log('dates', dates, DATA_API_URL);
  const fetchConferenceData = useCallback(async () => {
    try {
      const response = await fetch(`${DATA_API_URL}/api/v1/admin/conferences/history/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      
      // Convert dates to the new format
      const formattedDates = data.dates?.map((date: any) => ({
        type: date.type || ConferenceDateType.OTHER_DATE,
        name: date.name || '',
        startDate: date.startDate ? dayjs(date.startDate).format('YYYY-MM-DD') : '',
        endDate: date.endDate ? dayjs(date.endDate).format('YYYY-MM-DD') : ''
      })) || [];

      // Ensure topics is always an array
      if (data.topics && Array.isArray(data.topics)) {
        reset({
          ...data,
          topics: data.topics,
          dates: formattedDates,
          locations: Array.isArray(data.locations) ? data.locations : [],
        });
      } else {
        reset({
          ...data,
          topics: [],
          dates: formattedDates,
          locations: Array.isArray(data.locations) ? data.locations : [],
        });
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
      toast.error(t('modal.editForm.fetchError'));
    }
  }, [params.id, reset, t]);

  useEffect(() => {
    fetchConferenceData();
  }, [fetchConferenceData]);

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
    // Khi tắt chế độ chỉnh sửa, reset lại form để bỏ qua các thay đổi chưa lưu
    if (editMode[group]) {
        fetchConferenceData(); // Tải lại dữ liệu gốc
    }
    setEditMode(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formState = watch();
      
      // Remove validation check
      const updatedData: Partial<FormValues> = {};

      if (editMode.basicInfo) {
        updatedData.year = formState.year;
        updatedData.accessType = formState.accessType;
        updatedData.publisher = formState.publisher;
        updatedData.summerize = formState.summerize;
        updatedData.callForPaper = formState.callForPaper;
      }

      if (editMode.links) {
        updatedData.link = formState.link;
        updatedData.cfpLink = formState.cfpLink;
        updatedData.impLink = formState.impLink;
      }

      if (editMode.locations) {
        updatedData.locations = formState.locations;
      }

      updatedData.topics = formState.topics;
      updatedData.dates = formState.dates;

      console.log('Submitting form state:', updatedData);

      const response = await fetch(`${DATA_API_URL}/api/v1/admin/conferences/update-history`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.id,
          ...updatedData,
        }),
      });

      if (!response.ok) throw new Error('Failed to update data');
      const responseData = await response.json();

      await fetchConferenceData();
      
      setEditMode({
        basicInfo: false,
        links: false,
        locations: false,
      });

      toast.success(t('modal.editForm.updateSuccess'));

    } catch (error) {
      console.error('Error updating conference history:', error);
      toast.error(t('modal.editForm.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        {/* Sử dụng key dịch cho tiêu đề */}
        <h1 className="text-2xl font-bold">{t('editHistoryTitle')}</h1>
        {/* Sử dụng key dịch cho nút Cancel */}
        <Link
          href="/dashboard/conferences"
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          {t('modal.editForm.cancel')}
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Group */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            {/* Sử dụng key dịch cho tiêu đề nhóm */}
            <h2 className="text-lg font-semibold">{t('modal.editForm.basicInfoTitle')}</h2>
            {/* Sử dụng key dịch cho nút Edit/Cancel Edit */}
            <button
              type="button"
              onClick={() => toggleEditMode('basicInfo')}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editMode.basicInfo ? t('modal.editForm.editModeCancelButton') : t('modal.editForm.editModeEditButton')}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Sử dụng sm:grid-cols-2 cho layout tốt hơn trên màn hình lớn */}
            <div>
              {/* Sử dụng key dịch cho label */}
              <label htmlFor="year" className="block text-sm font-medium mb-1">{t('modal.editForm.year')}</label>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <input
                    id="year"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!editMode.basicInfo}
                  />
                )}
              />
            </div>

            <div>
              {/* Sử dụng key dịch cho label */}
              <label htmlFor="accessType" className="block text-sm font-medium mb-1">{t('modal.editForm.accessType')}</label>
              <Controller
                name="accessType"
                control={control}
                render={({ field }) => (
                  <select id="accessType" {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.basicInfo}>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                )}
              />
            </div>
          </div>

          <div className="mt-4">
            {/* Sử dụng key dịch cho label */}
            <label htmlFor="publisher" className="block text-sm font-medium mb-1">{t('modal.editForm.publisher')}</label>
            <Controller
              name="publisher"
              control={control}
              render={({ field }) => (
                <input id="publisher" {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.basicInfo} />
              )}
            />
          </div>

          <div className="mt-4">
            {/* Sử dụng key dịch cho label (sử dụng key summary thay vì summerize) */}
            <label htmlFor="summerize" className="block text-sm font-medium mb-1">{t('modal.editForm.summary')}</label>
            <Controller
              name="summerize"
              control={control}
              render={({ field }) => (
                <textarea id="summerize" {...field} className="w-full px-3 py-2 border rounded-md" rows={3} disabled={!editMode.basicInfo} />
              )}
            />
          </div>

          <div className="mt-4">
            {/* Sử dụng key dịch cho label */}
            <label htmlFor="callForPaper" className="block text-sm font-medium mb-1">{t('modal.editForm.callForPaper')}</label>
            <Controller
              name="callForPaper"
              control={control}
              render={({ field }) => (
                <textarea id="callForPaper" {...field} className="w-full px-3 py-2 border rounded-md" rows={3} disabled={!editMode.basicInfo} />
              )}
            />
          </div>
        </div>

        {/* Links Group */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            {/* Sử dụng key dịch cho tiêu đề nhóm */}
            <h2 className="text-lg font-semibold">{t('modal.editForm.linksTitle')}</h2>
            {/* Sử dụng key dịch cho nút Edit/Cancel Edit */}
            <button
              type="button"
              onClick={() => toggleEditMode('links')}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editMode.links ? t('modal.editForm.editModeCancelButton') : t('modal.editForm.editModeEditButton')}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> {/* Sử dụng sm:grid-cols-3 cho layout tốt hơn */}
            <div>
              {/* Sử dụng key dịch cho label */}
              <label htmlFor="link" className="block text-sm font-medium mb-1">{t('modal.editForm.mainLink')}</label>
              <Controller
                name="link"
                control={control}
                render={({ field }) => (
                  <input id="link" type="url" {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.links} />
                )}
              />
            </div>

            <div>
              {/* Sử dụng key dịch cho label */}
              <label htmlFor="cfpLink" className="block text-sm font-medium mb-1">{t('modal.editForm.cfpLink')}</label>
              <Controller
                name="cfpLink"
                control={control}
                render={({ field }) => (
                  <input id="cfpLink" type="url" {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.links} />
                )}
              />
            </div>

            <div>
              {/* Sử dụng key dịch cho label */}
              <label htmlFor="impLink" className="block text-sm font-medium mb-1">{t('modal.editForm.importantLink')}</label>
              <Controller
                name="impLink"
                control={control}
                render={({ field }) => (
                  <input id="impLink" type="url" {...field} className="w-full px-3 py-2 border rounded-md" disabled={!editMode.links} />
                )}
              />
            </div>
          </div>
        </div>

        {/* Locations Group */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            {/* Sử dụng key dịch cho tiêu đề nhóm */}
            <h2 className="text-lg font-semibold">{t('modal.editForm.locations')}</h2>
            {/* Sử dụng key dịch cho nút Edit/Cancel Edit */}
             <button
              type="button"
              onClick={() => toggleEditMode('locations')}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editMode.locations ? t('modal.editForm.editModeCancelButton') : t('modal.editForm.editModeEditButton')}
            </button>
          </div>
          {editMode.locations && (
            // Sử dụng key dịch cho nút Add Location
            <button
              type="button"
              onClick={() => appendLocation({ address: '', cityStateProvince: '', country: '', continent: '' })}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
            >
              {t('modal.editForm.addLocation')}
            </button>
          )}
          {locationFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-2 border rounded-md"> {/* Thêm padding và border cho từng mục */}
              <Controller
                name={`locations.${index}.address`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    // Sử dụng key dịch cho placeholder
                    placeholder={t('modal.editForm.addressPlaceholder')}
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
                    // Sử dụng key dịch cho placeholder
                    placeholder={t('modal.editForm.cityStateProvincePlaceholder')}
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
                    // Sử dụng key dịch cho placeholder
                    placeholder={t('modal.editForm.countryPlaceholder')}
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
                    // Sử dụng key dịch cho placeholder
                    placeholder={t('modal.editForm.continentPlaceholder')}
                    className="px-3 py-2 border rounded-md"
                    disabled={!editMode.locations}
                  />
                )}
              />
              {/* Nút remove luôn ở dưới các input cho layout tốt hơn */}
              {editMode.locations && locationFields.length > 1 && ( // Chỉ hiển thị nút remove nếu có nhiều hơn 1 location
                <div className="sm:col-span-2 flex justify-end"> {/* Đảm bảo nút remove chiếm hết chiều rộng nếu cần */}
                  <button
                    type="button"
                    onClick={() => removeLocation(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    {/* Sử dụng key dịch cho nút Remove */}
                    {t('modal.editForm.removeButton')}
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* Lưu ý: Errors cho locations sẽ hiển thị chung, Zod errors cụ thể cho từng trường con cần xử lý riêng nếu muốn chi tiết hơn */}
        </div>

        {/* Topics Group - Always Editable */}
        <div className="border rounded-lg p-4">
          {/* Sử dụng key dịch cho tiêu đề nhóm */}
          <h2 className="text-lg font-semibold mb-4">{t('modal.editForm.topics')}</h2>
          <TopicsTable
            topics={topics}
            onTopicsChange={handleTopicsChange}
            // Props khác cho TopicsTable có thể cần dịch (ví dụ: placeholder input, nút add)
            // tFunction={t} // Truyền hàm t vào TopicsTable nếu nó cần dịch nội bộ
            // translateKeys={{ addTopic: t('modal.editForm.addTopicButton'), topicPlaceholder: t('modal.editForm.topicPlaceholder'), ... }}
          />
        </div>

        {/* Dates Group - Always Editable */}
        <div className="border rounded-lg p-4">
          {/* Sử dụng key dịch cho tiêu đề nhóm */}
          <h2 className="text-lg font-semibold mb-4">{t('modal.editForm.dates')}</h2>
          <DatesTable
            control={control}
            watch={watch}
            name="dates"
            onRefetch={fetchConferenceData}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
           {/* Sử dụng key dịch cho nút Cancel cuối form */}
          <button
            type="button"
            onClick={() => router.push(`/${params.locale}/dashboard/conferences`)}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            {t('modal.editForm.cancel')}
          </button>
           {/* Sử dụng key dịch cho nút Save */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            onClick={(e) => {
              e.preventDefault();
              onSubmit()
            }}
          >
            {isSubmitting ? t('modal.editForm.saving') : t('modal.editForm.save')}
          </button>
        </div>
      </form>
    </div>
  );
}