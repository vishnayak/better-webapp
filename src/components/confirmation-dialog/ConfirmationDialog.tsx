import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import './ConfirmationDialog.css';

export interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    text?: string;
}
  
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ onClose, onConfirm, open, text }) => {
    return (
      <Dialog onClose={onClose} open={open}>
        <DialogTitle classes={{root: 'confirmation-dialog-title-root'}}>{text || 'Are you sure?'}</DialogTitle>
        <DialogActions>
          <Button onClick={onConfirm}>Yes</Button>
          <Button onClick={onClose} autoFocus>No</Button>
        </DialogActions>
      </Dialog>
    );
  }