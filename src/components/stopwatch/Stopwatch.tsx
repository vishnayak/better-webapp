import React, {useEffect, useState} from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { IconButton, Typography } from '@mui/material';
import './Stopwatch.css';

export const Stopwatch: React.FC<{}> = () => {
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    useEffect(() => {
        let interval: NodeJS.Timer;
        if (running) {
                interval = setInterval(() => {
                setTime((prevTime) => prevTime + 100);
            }, 100);
        } else if (!running) {
            clearInterval(interval!!);
        }
        return () => clearInterval(interval);
    }, [running]);
    return (
        <div className="stopwatch">
            <Typography className='stopwatch-numbers' variant="body2">
                <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
                <span>{("0" + Math.floor((time / 1000) % 60)).slice(-2)}</span>
            </Typography>
            <div className="stopwatch-buttons">
                {!running ? 
                    <IconButton onClick={() => setRunning(true)} aria-label='start-stopwatch' size='small'>
                        <PlayArrowIcon />
                    </IconButton> :
                    <IconButton onClick={() => setRunning(false)} aria-label='pause-stopwatch' size='small'>
                        <PauseIcon />
                    </IconButton>
                }
                <IconButton onClick={() => setTime(0)} aria-label='reset-stopwatch' size='small'>
                    <RestartAltIcon />
                </IconButton>     
            </div>
        </div>
    );
};