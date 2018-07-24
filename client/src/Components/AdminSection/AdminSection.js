import { Paper, Typography, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import UserDataTable from './UserDataTable/UserDataTable';

const styles = theme => ({
    root: {
        textAlign: "center"
    },
    paper: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
});

class AdminSection extends Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Typography variant="headline" component="h3">Admin-panel</Typography>
                    <hr />
                    <p>Bulkaktivering med Vipps-csv | Laste opp Terms of Service | Eksportere nyhetsbrevliste | Eksportere epostliste</p>
                </Paper>
                <br />
                <UserDataTable />
            </div>
        );
    }
}

export default withStyles(styles)(AdminSection);
