'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateCustomerForm } from './CreateCustomerForm';

export interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (customer: any) => void;
}

export function CreateCustomerDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your system. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>
        <CreateCustomerForm
          onSuccess={(customer) => {
            onSuccess?.(customer);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

