// FILE: /ConferencesPage.tsx

'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { toast } from 'react-toastify';

import { Organization, Conference } from './utils/types';
import { useConferences } from '@/src/hooks/conferences/useConferences';
import { ConferenceTable } from './ConferenceTable';
import { ConferenceHistoryModal } from './ConferenceHistoryModal';
import { FilterSection } from './FilterSection'; // Điều chỉnh đường dẫn
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'; // Điều chỉnh đường dẫn
import { PaginationControls } from './PaginationControls';

const DATA_API_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

export default function ConferencesPage({ locale }: { locale: string }) {
  const t = useTranslations('conferencesPage');
  const tCommon = useTranslations('common');

  const {
    rowData,
    loading,
    pagination,
    filters,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleResetFilters,
    setRowData,
  } = useConferences();

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State để quản lý đối tượng đang được chọn để thực hiện hành động
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // Mở modal lịch sử
  const handleViewHistory = useCallback((conference: Conference) => {
    setSelectedConference(conference);
    setIsHistoryModalOpen(true);
  }, []);

  // Mở dialog xác nhận xóa cho Conference
  const handleDeleteConferenceClick = useCallback((conference: Conference) => {
    setSelectedConference(conference);
    setSelectedOrganization(null); // Đảm bảo chỉ có một đối tượng được chọn
    setIsDeleteDialogOpen(true);
  }, []);

  // Mở dialog xác nhận xóa cho Organization (từ modal)
  const handleDeleteOrganizationClick = useCallback((organization: Organization) => {
    setSelectedOrganization(organization);
    setSelectedConference(null); // Đảm bảo chỉ có một đối tượng được chọn
    setIsDeleteDialogOpen(true);
  }, []);

  // Xử lý khi xác nhận xóa
  const handleConfirmDelete = async () => {
    if (selectedConference) {
      // Logic xóa Conference
      try {
        await axios.delete(`${DATA_API_URL}/api/v1/admin/conferences/remove/${selectedConference.id}`);
        setRowData(prev => prev.filter(conf => conf.id !== selectedConference.id));
        toast.success(tCommon('deleteSuccess'));
      } catch (error) {
        console.error('Error deleting conference:', error);
        toast.error(tCommon('deleteError'));
            
    setIsDeleteDialogOpen(false);
    setSelectedConference(null);
    setSelectedOrganization(null);
      }
    } else if (selectedOrganization) {
      // Logic xóa Organization (chưa có trong code gốc, nhưng đây là cách xử lý)
      // Nếu bạn cần logic này, bạn sẽ thêm API call ở đây.
      // Ví dụ:
      await axios.delete(`${DATA_API_URL}/api/v1/admin/conferences/history/${selectedOrganization.id}`);
      toast.success("Successfully deleted organization history");
      // Sau đó, bạn cần refresh lại dữ liệu của modal
      // console.log("Deleting organization:", selectedOrganization);
      // toast.info("Organization delete logic to be implemented.");
      // setSelectedOrganization(null);
      return
    }

  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('pageTitle')}</h1>

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <ConferenceTable
        rowData={rowData}
        loading={loading}
        onViewHistory={handleViewHistory}
        onDelete={handleDeleteConferenceClick}
      />

      {loading && (
        <div className="text-center py-4">{tCommon('loading')}</div>
      )}

      <PaginationControls
        currentPage={pagination.page}
        totalPages={pagination.lastPage}
        onPageChange={handlePageChange}
        pageSize={pagination.pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      <ConferenceHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        conference={selectedConference}
        onDeleteOrganization={handleDeleteOrganizationClick}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={selectedConference?.title || selectedOrganization?.year.toString() || ''}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}