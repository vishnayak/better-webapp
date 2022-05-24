import React from 'react';
import './SubmissionsPage.css';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { deleteSubmission, getAllSubmissions, Submission, SubmissionStatus } from '@services/submission-service';
import { Button, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { ConfirmationDialog } from '@components/confirmation-dialog/ConfirmationDialog';
import { SubmissionCreation } from '@components/submission-creation/SubmissionCreation';

const columns: GridColDef[] = [
    {
        field: 'taskTitle',
        headerName: 'Task Title',
        width: 200,
    },
    {
        field: 'reqText',
        headerName: 'Request',
        width: 300,
    },
    {
        field: 'when',
        headerName: 'Created On',
        type: 'dateTime',
        valueGetter: ({ value }) => value && new Date(value),
        width: 200,
    },
    {
        field: 'status',
        headerName: 'Execution Status',
        description: 'SUBMITTED: Not yet executed; COMPLETED: Executed',
        renderCell: (params) => {
            const status = (params.row as Submission).status;
            return <>{status} &nbsp;
                {status === SubmissionStatus.SUBMITTED && <HourglassTopIcon color={'disabled'} />}
                {status === SubmissionStatus.COMPLETED && <CheckIcon color={'success'} />}
            </>;
        },
        width: 150,
    }
];

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

export const SubmissionsPage: React.FC<{}> = () => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [isError, setIsError] = React.useState(false);
    const [submissions, setSubmissions] = React.useState<Submission[]>([]);
    const [isCreatingSubmission, setIsCreatingSubmission] = React.useState<boolean>(false);
    const [deletingSubmissionId, setDeletingSubmissionId] = React.useState<string | undefined>(undefined);
    const fetchSubmissions = () => {
        getAllSubmissions().then(res => {
            setSubmissions(res); setIsLoading(false); 
        }).catch(e => {
            setIsError(true);
            setIsLoading(false);
        });
    };

    React.useEffect(fetchSubmissions, []);

    const gridColDefs: GridColDef[] = [...columns, 
        {
            field: 'actions',
            headerName: 'Actions',
            renderCell: (params) => {
                return <>
                    {(params.row as Submission).status === SubmissionStatus.COMPLETED && 
                        <Link className={'link-text'} to={`/submissions/${(params.row as Submission).id}`}>
                            <Button variant={'outlined'}>
                                Get Hits
                            </Button>
                        </Link>
                    }
                    <IconButton onClick={() => handleDeleteRow((params.row as Submission).id)}>
                        <DeleteIcon color='disabled' />
                    </IconButton>
                </>;
            },
            flex: 1,
            sortable: false,
            filterable: false,
            disableExport: true,
        }   
    ];

    const handleDeleteRow = (id: string) => {
        setDeletingSubmissionId(id);
    };

    const handleConfirmDelete = () => {
        deletingSubmissionId && deleteSubmission(deletingSubmissionId).then(res => { 
            res && fetchSubmissions();  // delete, then update data-grid
            setDeletingSubmissionId(undefined);
        });
    };

    const handleCreate = () => {
        setIsCreatingSubmission(false);
        fetchSubmissions();
    };

    const handleTaskCreationClick = () => {
        setIsCreatingSubmission(isCreatingSubmission => !isCreatingSubmission);
    }

    return <div className='submissions-page'>
        {
        !isLoading ? isError ? <div className='fallback-text'>Something went wrong, please try reloading the page.</div> :
            <>
                <div className='submissions-page-header'>
                    <span className='submissions-page-title'>Submissions</span>
                    <div className={`submissions-page-creation ${isCreatingSubmission ? 'submissions-page-creation-bordered' : ''}`}>
                        <div className='submissions-page-creation-title'>
                            <h2>{isCreatingSubmission ? 'Create and Run New Submission' : ''}</h2>
                            <Button 
                                onClick={handleTaskCreationClick} 
                                variant={isCreatingSubmission ? 'outlined' : 'contained'} 
                                classes={{root: 'submissions-page-creation-button'}}
                            >
                                {isCreatingSubmission ? 'Cancel' : <><AddIcon /> Create a Submission</>}
                            </Button>
                        </div>
                        {isCreatingSubmission && <SubmissionCreation onCreate={handleCreate} />}
                    </div>
                </div>
                <DataGrid
                    rows={submissions}
                    columns={gridColDefs}
                    rowsPerPageOptions={[10, 20, 50]}
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'when', sort: 'desc' }],
                        },
                    }}
                    components={{
                        Toolbar: CustomToolbar
                    }}
                    disableSelectionOnClick
                />
                {deletingSubmissionId && <ConfirmationDialog open={!!deletingSubmissionId} onConfirm={handleConfirmDelete} onClose={() => setDeletingSubmissionId(undefined)} />}
            </>
        : <div className='fallback-text'>Loading...</div>
    }</div>;
};