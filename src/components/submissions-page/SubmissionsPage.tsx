import React from 'react';
import './SubmissionsPage.css';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckIcon from '@mui/icons-material/Check';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { getAllSubmissions, Submission, SubmissionStatus } from '@services/query-service';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

const columns: GridColDef[] = [
    {
        field: 'taskId',
        headerName: 'Task ID',
        width: 100,
    },
    {
        field: 'requestId',
        headerName: 'Request ID',
        width: 150,
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
    },
    {
        field: 'actions',
        headerName: 'Actions',
        renderCell: (params) => {
            if((params.row as Submission).status !== SubmissionStatus.COMPLETED) {
                return '';
            }
            return <Link className={'link-text'} to={`/hits/${(params.row as Submission).id}`}>
                <Button variant={'outlined'}>
                    Get Hits
                </Button>
            </Link>;
        },
        flex: 1,
        sortable: false,
        filterable: false,
        disableExport: true,
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
    React.useEffect(() => {
        getAllSubmissions().then(res => {
            setSubmissions(res); setIsLoading(false); 
        }).catch(e => {
            setIsError(true);
            setIsLoading(false);
        });
    }, []);

    return <div className='submissions-page'>
        <h1>Query Dashboard</h1>
        {
        !isLoading ? isError ? <div className='fallback-text'>Something went wrong, please try reloading the page.</div> :
            <DataGrid
                rows={submissions}
                columns={columns}
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
        : <div className='fallback-text'>Loading...</div>
    }</div>;
};