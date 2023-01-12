import { AppBar, Typography, Toolbar } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useLocation, useNavigate } from "react-router";
import { COLOR_PALETTE } from "../../Constants";
import React, { useState } from "react";
import { saveUser, login } from "../../requests/users-req";
import MTDropdown from "../mui/MTDropdown";
import MTButton from '../mui/MTButton';
import { userState } from "../../states/userState";
import { pageState } from "../../states/pageState";
import { useHookstate } from "@hookstate/core";

const useStyles = makeStyles({
    toolBar: {
        backgroundColor: COLOR_PALETTE.NAVY_BLUE,
        display: 'flex',
        flexDirection: 'row',
        gap: '30px'
    },
    logoTitleContainer: {
        height: '100%',
        display: 'flex',
        cursor: 'pointer',
        alignItems: 'center',
    },
    myTill: {
        fontFamily: 'Arial',
        fontSize: '35px'
    },
    signUpLoginContainer: {
        display: 'flex',
        gap: '16px',
        marginLeft: 'auto'
    },
    logo: {
        height: '40px',
        width: '40px'
    },
    dropdownContainer: {
        display: 'flex',
        gap: '12px'
    },
    separator: {
        width: '1px',
        height: '35px',
        opacity: '0.7',
        backgroundColor: COLOR_PALETTE.BABY_BLUE,
    }
});

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const uState = useHookstate(userState);

    // Might be worth making a new file in routes for redirecting the user to certain pages. Ex. handleAccessTill

    const handleAccessTill = () => {
        navigate('/access-till');
    }
    
    const handleSignUp = () => {
        pageState.previousPage.set(location.pathname);
        navigate('/create-account');
    }

    // // TODO
    // async function handleTemp () {
    //     let res = await saveUser({
    //         fname: 'test',
    //         lname: 'icle',
    //         email: 'testicle@domain.cum'+Math.floor(Math.random()*100),
    //         password: 'temp123'
    //     })
    //     console.log(res);
    // }

    // async function handleTemp2 () {
    //     let res = await login({
    //         email: 'testicle@domain.cum',
    //         password: 'temp123'
    //     })
    //     console.log(res);
    // }

    const handleHome = () => {
        navigate('/');
    }

    const handleLogin = async() => {
        let loginUser = {
            email: 'bruh@gmail.com',
            password: 'bruh'
        }
        let response = await login(loginUser);

        if((!!response)) {
            uState.user.set(response);
            uState.isLoggedIn.set(true);
            console.log(uState.user.get());
            console.log(uState.isLoggedIn.get());
        }
        // navigate('/login');
    }

    const dropdownMenuItems_ForEmployees = [
        {id: 1, title: 'Open Till', action: () => handleAccessTill()}
    ];
    
    const dropdownMenuItems_Pages = [
        {id: 1, title: 'About', action: () => {}},
        {id: 2, title: 'Contact Us', action: () => {}}
    ];

    const dropdownMenuItems_Account = [
        {id: 1, title: 'View Business Profile', action: () => {
            navigate('/create-business'); 
            pageState.previousPage.set(location.pathname)}},
        {id: 2, title: 'Edit Profile', action: () => {}},
        {id: 3, title: 'Logout', action: () => {uState.isLoggedIn.set(false)}}
    ];

    const classes = useStyles();

    return (
        <div>
            <AppBar position="static">
                <Toolbar className={classes.toolBar}>
                    <div className={classes.logoTitleContainer} onClick={handleHome}>
                        {/* <img src={logoSD} alt="logo" className={classes.logo}/> */}
                        <Typography sx={{
                            fontSize: '35px',
                            fontFamily: 'Arial',
                            color: COLOR_PALETTE.BABY_BLUE
                        }}>my</Typography>
                        <Typography sx={{
                            fontSize: '35px',
                            fontFamily: 'Arial',
                            color: COLOR_PALETTE.BLUE_GROTTO
                        }}>Till</Typography>
                    </div>
                    <div className={classes.separator}></div>
                    <div className={classes.dropdownContainer}>
                        <MTDropdown label={'Pages'} menuItems={dropdownMenuItems_Pages}/>
                        <MTDropdown label={'For Employees'} menuItems={dropdownMenuItems_ForEmployees}/>
                    </div>
                    {!uState.isLoggedIn.get() ? 
                        <div className={classes.signUpLoginContainer}>
                            <MTButton variant="contained" onClick={handleLogin} label={'SIGN IN'}/>
                            <MTButton variant="contained" onClick={handleSignUp} label={'CREATE ACCOUNT'} />
                        </div>
                        : 
                        <div className={classes.signUpLoginContainer}>
                            <MTDropdown isAccount menuItems={dropdownMenuItems_Account} />
                        </div>
                    }
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default Header;