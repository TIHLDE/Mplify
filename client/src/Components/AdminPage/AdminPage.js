import { Button, Paper, Typography, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import BulkActivate from './BulkActivate';
import UserDataTable from './UserDataTable';
import ExportEmailList from './ExportEmailList';
import UpdateTermsOfService from './UpdateTermsOfService';
import EditUser from './EditUser';
import UserApi from "../../Api/UserApi";

const styles = theme => ({
    root: {
        textAlign: "center"
    },
    paper: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    }
});

class AdminPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticating: true,
            redirectToLoginPage: false,

            editingUser: false,
            userToEdit: null
        };
    }

    componentWillMount() {
        const token = sessionStorage.getItem('token');
        if (token) {
            UserApi.checkValidToken(token)
                .then(response => {
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

    handleStartEditingUser = (user) => {        
        this.setState({
            editingUser: true,
            userToEdit: user
        });        
    };

    handleStopEditingUser = () => {
        this.setState({
            editingUser: false,
            userToEdit: null
        });
    };

    onLogout = () => {
        this.props.onLogout();
        this.setState({ redirectToLoginPage: true });
    };

    render() {
        const { classes } = this.props;

        const loadingScreen = (
            <Paper className={classes.paper}>
                <Typography variant="headline" component="h3">Autentiserer...</Typography>
            </Paper>
        );

        const adminContent = (
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Typography variant="headline" component="h3">Admin-panel</Typography>
                    <hr />
                    <br />
                    <Grid container spacing={8}>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <BulkActivate />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <UpdateTermsOfService />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <ExportEmailList newsletter={true} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <ExportEmailList />
                        </Grid>
                    </Grid>
                    <br />
                    <br />
                    <Button size="large" variant="contained" color="secondary" onClick={this.onLogout.bind(this)}>Logg ut</Button>
                </Paper>
                <br />
                { this.state.editingUser ? <EditUser onStopEditingUser={this.handleStopEditingUser.bind(this)} userToEdit={this.state.userToEdit} /> : <UserDataTable onStartEditingUser={this.handleStartEditingUser.bind(this)} /> }
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

export default withStyles(styles)(AdminPage);
