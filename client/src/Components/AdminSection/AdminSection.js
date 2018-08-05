import { Paper, Typography, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import UserDataTable from './UserDataTable/UserDataTable';
import { Redirect } from 'react-router-dom';

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
            redirectToLoginPage: false
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
                    this.setState({ redirectToLoginPage: true });
                }
            }).catch(error => {
                console.log(error);
                this.setState({ redirectToLoginPage: true });
            });
        } else {
            this.setState({ redirectToLoginPage: true });
        }

    }

    onLogout = () => {
        this.props.onLogout();
        this.setState({ redirectToLoginPage: true });
    }

    render() {
        const { classes } = this.props;

        const loadingScreen = (
            <Paper className={classes.paper}>
                <Typography variant="headline" component="h3">Autentiserer...</Typography>
            </Paper>
        );

        const adminContent = (
            <div>
                <Paper className={classes.paper}>
                    <Typography variant="headline" component="h3">Admin-panel</Typography>
                    <hr />
                    <p>Bulkaktivering med Vipps-csv | Laste opp Terms of Service | Eksportere nyhetsbrevliste | Eksportere epostliste</p>
                    <Button size="large" variant="contained" color="secondary" onClick={this.onLogout.bind(this)}>Logg ut</Button>
                </Paper>
                <br />
                <UserDataTable />
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
