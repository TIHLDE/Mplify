import { Paper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';

const styles = theme => ({
    root: {
        textAlign: "center"
    },
    paper: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        maxWidth: 600,
        marginLeft: "auto",
        marginRight: "auto",
    },
});

class AwaitingConfirmationPage extends Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Typography variant="h5" component="h3">Takk for at du registerte deg!</Typography>
                    <hr />
                    <p>Vi har nå sendt en epost til student-eposten din for å bekrefte den.</p>
                    <p>Åpne eposten og følg lenken for å fullføre registeringen.</p>
                    <p>Du kan nå lukke denne siden.</p>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(AwaitingConfirmationPage);
