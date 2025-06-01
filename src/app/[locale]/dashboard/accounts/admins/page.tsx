'use client';

import { useState } from 'react';
import { useUserManagement } from '@/src/hooks/useUserManagement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from '@/components/ui/pagination';
import { PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { CreateAdminDialog } from './CreateAdminDialog';
import { UpdateAdminStatusDialog } from './UpdateAdminStatusDialog';
import { Plus } from 'lucide-react';

export default function AdminsPage() {
  const {
    state,
    setState,
    data: admins,
    loading,
    error,
    totalPages,
    refetch
  } = useUserManagement('admins');

  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Admin
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search admins..."
          value={state.search}
          onChange={(e) => setState(prev => ({ ...prev, search: e.target.value }))}
          className="max-w-sm"
        />
        <Select
          value={state.status || 'all'}
          onValueChange={(value) => setState(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="w-[180px] bg-white border-[#e5e7eb] text-[#374151] hover:border-[#2563eb] focus:border-[#2563eb] focus:ring-[#2563eb]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{`${admin.fullName}`}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded ${
                      admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setIsStatusDialogOpen(true);
                      }}
                      className="border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6] hover:text-[#2563eb]"
                    >
                      {admin.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setState(prev => ({ ...prev, page: prev.page - 1 }))}
                    aria-disabled={state.page === 1}
                    className={state.page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive>
                    {state.page}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setState(prev => ({ ...prev, page: prev.page + 1 }))}
                    aria-disabled={state.page === totalPages}
                    className={state.page === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}

      <CreateAdminDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={refetch}
      />

      <UpdateAdminStatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        admin={selectedAdmin}
        onSuccess={refetch}
      />
    </div>
  );
} 