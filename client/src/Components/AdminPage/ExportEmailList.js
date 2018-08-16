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
    },
    textArea: {
        resize: "none"
    }
});

class ExportEmailList extends Component {

    buttonName = 'Eksporter Epostliste';
    dialogTitle = 'Epostliste med alle aktive brukere';
    emailUri = '/api/get_email';

    constructor() {
        super();
        this.state = {
            exportEmailListDialogOpen: false,
            retrieving: false,
            retrieved: false,
            emailList: []
        };
    }

    componentWillMount() {
        if (this.props.newsletter) {
            this.emailUri = '/api/get_newsletter_email';
            this.buttonName = 'Eksporter Nyhetsbrevliste';
            this.dialogTitle = 'Epostliste for nyhetsbrev';
        }
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
        this.getData(this.emailUri)
            .then(response => response.json())
            .then(result => {
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
                'Content-Type': 'application/csv',
                'X-CSRF-Token': sessionStorage.getItem('token')
            }
        };
        const res = await fetch(endpoint, options);
        return res;
    }

    copyEmails = () => {
        let textarea = document.getElementById("emails");
        textarea.select();
        document.execCommand("copy");
    }

    render() {
        const { classes } = this.props;

        const emailList = (
            <textarea id="emails" className={classes.textArea} readOnly rows={12} cols={50} value={this.state.emailList.map(user => user.student_email).join(';')}></textarea>
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
                <DialogTitle id="alert-dialog-title">{this.dialogTitle}</DialogTitle>
                <DialogContent>
                    {
                        this.state.retrieving
                            ? listLoadingContent
                            : listDoneLoadingContent
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleDialogClose} color="primary">Lukk</Button>
                    <Button onClick={this.copyEmails} color="primary" disabled={!this.state.retrieved}>Kopier adresser</Button>
                </DialogActions>
            </Dialog>
        );

        return (
            <div>
                <Button variant="contained" color="primary" onClick={this.handleExportEmailListDialogOpen}>{this.buttonName}</Button>
                {exportEmailListDialog}
            </div>
        );
    }
}

export default withStyles(styles)(ExportEmailList);