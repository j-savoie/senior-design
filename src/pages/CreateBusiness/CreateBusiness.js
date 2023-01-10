import { Alert, Grid, Paper, Snackbar, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";
import { COLOR_PALETTE, FONT_FAMILY } from "../../Constants";
import MTTextField from '../../components/mui/MTTextField' 
import MTSelect from "../../components/mui/MTSelect";
import MTButton from "../../components/mui/MTButton";

const useStyles = makeStyles({
    root: {
        height: 'calc(100vh - 101px)',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    paper: {
        height: 'fit-content',
        width: '40%',
    },
    container: {
        padding: '30px'
    },
    title: {
        marginBottom: '24px'
    }
})

export const CreateBusiness = () => {

    const classes = useStyles();

    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState({message: '', status: 'success'});

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const handleSubmit = () => {
        
    }

    const businessTypes = [
        {id: 1, title: 'Whole Sale', onClick: (e) => setBusinessType(e.target.value)},
        {id: 2, title: 'Quick Service', onClick: (e) => setBusinessType(e.target.value)}
    ]

    return (
        <div className={classes.root}>
            <Paper className={classes.paper} square elevation={5} sx={{
                backgroundColor: COLOR_PALETTE.BABY_BLUE
            }}>
                <div className={classes.container}>
                    <div className={classes.title}>
                        <Typography sx={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: '600',
                            fontSize: '48px',
                            lineHeight: '56px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>Create Business</Typography>
                    </div>
                    <form id="create-account-form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={7}>
                                <MTTextField label={'Name'} value={businessName} onChangeFunc={setBusinessName} isFullWidth />
                            </Grid>
                            <Grid item xs={5}>
                                <MTSelect label={'Types'} items={businessTypes} value={businessType} setValue={setBusinessType} isFullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <MTButton label={'CREATE'} variant={'contained'} type={'submit'} isFullWidth></MTButton>
                            </Grid>
                        </Grid>
                    </form>
                    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                        <Alert onClose={handleClose} severity={alertMessage.status} variant="filled" sx={{ width: '100%' }}>
                            {alertMessage.message}
                        </Alert>
                    </Snackbar>
                </div>
            </Paper>
        </div>
    );
}