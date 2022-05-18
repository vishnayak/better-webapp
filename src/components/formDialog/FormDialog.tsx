import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ExampleDoc } from '@services/task-service';
import React from 'react';

interface FormDialogProps {
    taskDoc: ExampleDoc;
}

export const FormDialog: React.FC<FormDialogProps> = ({ taskDoc }) => {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <React.Fragment>
            {/* <div> */}
            <Button variant="outlined" onClick={handleClickOpen}>
                Doc - {taskDoc.docNumber}
            </Button>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle>Doc - {taskDoc.docNumber}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {taskDoc.docText}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
            {/* </div> */}
        </React.Fragment>
    );
}