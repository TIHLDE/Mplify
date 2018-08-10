import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';

const styles = theme => ({
    root: {
        textAlign: "center"
    },
    paper: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    }
});


class ExportEmailList extends Component {
    constructor() {
        super();
        this.state = {
            exportEmailListDialogOpen: false,
            retrieving: false,
            retrieved: false,
            emailList: []
        };
    }

    handleDialogClose = () => {
        this.setState({
            exportEmailListDialogOpen: false,
        });
    }

    handleExportEmailListDialogOpen = () => {
        this.setState({
            exportEmailListDialogOpen: true,
            retrieving: true
        });
        this.getData('http://localhost:8080/api/get_email')
            .then(response => response.json())
            .then(result => {
                console.log(result);
                if (result && result.length > 0) {
                    this.setState({
                        retrieving: false,
                        retrieved: true,
                        emailList: result
                    });
                } else {
                    this.setState({
                        retrieving: false
                    });
                }
            })
            .catch(err => {
                console.log(err);
                this.setState({
                    retrieving: false
                });
            });
    }

    async getData(endpoint, method = 'GET') {
        const options = {
            method: method,
            headers: {
                'Accept': 'application/csv',
                'Content-Type': 'application/csv'
            }
        };
        const res = await fetch(endpoint, options);
        return res;
    }

    render() {
        const { classes } = this.props;

        const emailList = (
            <ul>
                { this.state.emailList.map(user => <li key={user.user_id}>{user.student_email}</li>) }
            </ul>
        );

        const noEmailsFound = (
            <DialogContentText id="alert-dialog-description">
                Klarte ikke å hente eposter fra databasen :(
            </DialogContentText>
        );

        const listDoneLoadingContent = (
            this.state.retrieved
                ? emailList
                : noEmailsFound
        );

        const listLoadingContent = (
            <DialogContentText id="alert-dialog-description">
                Henter epost-liste fra databasen...
            </DialogContentText>
        );

        const exportEmailListDialog = (
            <Dialog
                open={this.state.exportEmailListDialogOpen}
                onClose={this.handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Epostliste med alle aktive brukere</DialogTitle>
                <DialogContent>
                    {
                        this.state.retrieving
                            ? listLoadingContent
                            : listDoneLoadingContent
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleDialogClose} color="primary">Lukk</Button>
                </DialogActions>
            </Dialog>
        );

        return (
            <div>
                <Button variant="contained" color="primary" onClick={this.handleExportEmailListDialogOpen}>Eksporter epostliste</Button>
                {exportEmailListDialog}
            </div>
        );
    }
}

export default withStyles(styles)(ExportEmailList);
