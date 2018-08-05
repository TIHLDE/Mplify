import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
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
        this.state = {
            authenticating: true,
            redirectToLoginPage: false,
            bulkActivateDialogOpen: false
        };
    }

    componentWillMount() {
        const token = sessionStorage.getItem('token');
        if (token) {
            const endpoint = 'http://localhost:8080/api/get_valid_token/' + token;
            const options = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };
            const res = fetch(endpoint, options);
            res.then(response => {
                if (response.ok) {
                    this.setState({ authenticating: false });
                } else {
                    this.setState({
                        redirectToLoginPage: true,
                        authenticating: false
                    });
                }
            }).catch(error => {
                console.log(error);
                this.setState({
                    redirectToLoginPage: true,
                    authenticating: false
                });
            });
        } else {
            this.setState({ redirectToLoginPage: true });
        }

    }

    handleDialogClose = () => {
        this.setState({
            bulkActivateDialogOpen: false,
        });
    }

    onLogout = () => {
        this.props.onLogout();
        this.setState({ redirectToLoginPage: true });
    }

    onBulkActivate = () => {
        this.setState({ bulkActivateDialogOpen: true });
    }

    render() {
        const { classes } = this.props;

        const loadingScreen = (
            <Paper className={classes.paper}>
                <Typography variant="headline" component="h3">Autentiserer...</Typography>
            </Paper>
        );

        const bulkActivateDialog = (
            <Dialog
                    open={this.state.bulkActivateDialogOpen}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Bekreft handling</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {
                                'hejj'
                            }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleDialogClose} color="primary">
                            Avbryt
                        </Button>
                        <Button onClick={this.handleActivationClick} color="primary" autoFocus>
                            {'Aktiver'}
                        </Button>
                    </DialogActions>
                </Dialog>
        );

        const adminContent = (
            <div>
                <Paper className={classes.paper}>
                    <Typography variant="headline" component="h3">Admin-panel</Typography>
                    <hr />
                    <p>Bulkaktivering med Vipps-csv | Laste opp Terms of Service | Eksportere nyhetsbrevliste | Eksportere epostliste</p>
                    <Button size="large" variant="contained" color="primary" onClick={this.onBulkActivate}>Bulk-aktivering</Button>
                    <Button size="large" variant="contained" color="primary" onClick={console.log.bind('hei')}>Oppdater Terms of Service</Button>
                    <Button size="large" variant="contained" color="primary" onClick={console.log.bind('hei')}>Eksporter nyhetsbrevliste</Button>
                    <Button size="large" variant="contained" color="primary" onClick={console.log.bind('hei')}>Eksporter epostliste</Button>
                    <br />
                    <br />
                    <Button size="large" variant="contained" color="secondary" onClick={this.onLogout.bind(this)}>Logg ut</Button>
                </Paper>
                <br />
                <UserDataTable />
                {bulkActivateDialog}
            </div>
        );

        const redirect = (
            <Redirect to='/login' />
        );

        return (
            <div className={classes.root}>
                {
                    this.state.authenticating
                        ? loadingScreen
                        : (this.state.redirectToLoginPage ? redirect : adminContent)
                }
            </div>
        );
    }
}

export default withStyles(styles)(AdminSection);
