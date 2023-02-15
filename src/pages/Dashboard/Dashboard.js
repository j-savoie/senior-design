import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Paper, Card, Typography, Box, Fab, IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Grid2 from "@mui/material/Unstable_Grid2";
import { COLOR_PALETTE, FONT_FAMILY } from "../../Constants";
import React, { useEffect, useState } from "react";
import { getBusiness } from "../../requests/businesses-req";
import { getUserName } from "../../requests/users-req";


const useStyle = makeStyles({
    root: {
        height: 'calc(100vh - 101px)',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    board: {
        height: '90%',
        minHeight: '90%',
        width: '90%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        display: 'flex',
        height: '95%',
        width: '95%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    widget: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        height: '100%',
        width: '100%',
    },
});

const Dashboard = () => {

    const classes = useStyle();

    const PIE_COLORS = [COLOR_PALETTE.BLUE_GREEN, COLOR_PALETTE.BLUE_GROTTO, COLOR_PALETTE.NAVY_BLUE, "#042E40"];

    const pieData = [
        {name: 'Food', orders: 40},
        {name: 'Drinks', orders: 15},
        {name: 'Combos', orders: 35},
        {name: 'Snacks', orders: 10}
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active) {
           return (
           <div
              className="custom-tooltip"
              style={{
                 backgroundColor: "#ffff",
                 padding: "5px",
                 border: "1px solid #cccc"
              }}
           >
              <label>{`${payload[0].name} : ${payload[0].value}%`}</label>
           </div>
        );
     }
     return null;
    };


    //const classes = useStyle();
    const [busName, setBusName] = useState("")
    const [busType, setBusType] = useState("")
    const [ownerName, setOwnerName] = useState("")

    useEffect(() => {
        async function getBus() {
            const bus = await getBusiness()
            setBusName(bus.formattedBus.name)
            setBusType(bus.formattedBus.type)
        }
        async function getOwner() {
            const owner = await getUserName()
            setOwnerName(owner.formattedUser.fname + " " + owner.formattedUser.lname)
        }
        getBus();
        getOwner();
      }, []);

    return (
            <div className={classes.root}>
                {/* <Paper className={classes.board} elevation={5} sx={{
                backgroundColor: COLOR_PALETTE.BABY_BLUE,
            }}> */}
                <div className={classes.container}>
                    <Grid2 container sx={{height: '100%', width: '100%'}} spacing={2}>
                        <Grid2 id='grid-panel-left' xs={12} md={5} sx={{height: '100%'}}>
                            <Grid2 container sx={{height: '100%', width: '100%', position: 'relative'}}>
                                <Grid2 id='grid-left-top' xs={12} md={12} sx={{position: 'absolute', top:0, left: 0, height: '40%'}}>
                                    <Card className={classes.widget} sx={{backgroundColor: COLOR_PALETTE.BABY_BLUE}} elevation={3}>
                                        <Box ml={4} mt={8}>
                                            <Box mb={2}>
                                                <Typography sx={{
                                                                fontFamily: FONT_FAMILY,
                                                                fontWeight: '400',
                                                                fontSize: '36px',
                                                                lineHeight: '40px',
                                                                display: 'flex'}}>
                                                    Welcome, {ownerName}!
                                                </Typography>
                                            </Box>
                                            <Typography sx={{
                                                            fontFamily: FONT_FAMILY,
                                                            fontWeight: '600',
                                                            fontSize: '48px',
                                                            lineHeight: '60px',
                                                            display: 'flex'}}>
                                                {busName}
                                            </Typography>
                                            <Typography sx={{
                                                            fontFamily: FONT_FAMILY,
                                                            fontWeight: '200',
                                                            fontSize: '28px',
                                                            lineHeight: '36px',
                                                            display: 'flex'}}>
                                                {busType}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </Grid2>
                                <Grid2 id='grid-left-bottom' xs={12} md={12} sx={{position: 'absolute', bottom: 0, left: 0, height: '60%'}}>
                                    <Card className={classes.widget} sx={{backgroundColor: COLOR_PALETTE.BABY_BLUE}} elevation={3}>
                                        <Box ml={4} mt={4} mr={4}>
                                            <Typography sx={{
                                                            fontFamily: FONT_FAMILY,
                                                            fontWeight: '600',
                                                            fontSize: '36px',
                                                            lineHeight: '44px',
                                                            display: 'flex'}}>
                                                Monthly Report
                                            </Typography>
                                            <ResponsiveContainer height={400} width={"100%"}>
                                                <PieChart>
                                                    <Pie data={pieData} dataKey="orders" nameKey="name" outerRadius={"80%"} >
                                                        {pieData.map((entry, index) => (
                                                            <Cell
                                                            key={`cell-${index}`}
                                                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Card>
                                </Grid2>
                            </Grid2>
                        </Grid2>  
                        <Grid2 id='grid-panel-right' xs={12} md={7} sx={{height: '100%'}}>
                            <Grid2 container sx={{height: '100%', width: '100%', position: 'relative', display: 'flex', alignItems: 'center'}}>
                                <Grid2 id='grid-right' xs={12} md={12} sx={{position: 'absolute', right: 0, height: '100%',}}>
                                    <Card className={classes.widget} sx={{backgroundColor: COLOR_PALETTE.BABY_BLUE, position: 'relative'}} elevation={3}>
                                        <Box ml={4} mt={8}>
                                            <Typography variant='h4'> Title3</Typography>
                                            <Typography variant='subtitle1'> Subtitle3 </Typography>
                                            <Fab color="primary" aria-label="add" sx={{position: 'absolute', bottom: 20, right: 20}}>
                                                <AddIcon />
                                            </Fab>
                                            <IconButton aria-label="more" sx={{position: 'absolute', top: 20, right: 20}}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </Box>
                                    </Card>
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    </Grid2>
            </div>
        </div>


    );
}

export default Dashboard;