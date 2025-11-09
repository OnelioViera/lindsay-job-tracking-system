'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateJobForm } from './CreateJobForm';

export interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (job: any) => void;
}

export function CreateJobDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateJobDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Add a new job to your system. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>
        <CreateJobForm
          onSuccess={(job) => {
            onSuccess?.(job);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

