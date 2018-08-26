import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import UserApi from "../../Api/UserApi";

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

class TermsOfService extends Component {

    constructor() {
        super();
        this.state = {
            termsOfServiceDialogOpen: false,
            retrieving: false,
            retrieved: false,
            termsOfService: ''
        };
    }

    handleDialogClose = () => {
        this.setState({
            termsOfServiceDialogOpen: false,
        });
    };

    handleTermsOfServiceDialogOpen = () => {
        this.setState({
            termsOfServiceDialogOpen: true,
            retrieving: true
        });
        UserApi.getTermsOfService()
            .then(response => response.json())
            .then(result => {                
                if (result) {
                    this.setState({
                        retrieving: false,
                        retrieved: true,
                        termsOfService: result[0].text
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
    };

    render() {
        const { classes } = this.props;

        const termsOfService = (
            <textarea id="emails" className={classes.textArea} readOnly rows={24} cols={window.innerWidth > 600 ? 60 : 40} value={this.state.termsOfService}></textarea>
        );

        const noTermsOfServiceFound = (
            <DialogContentText id="alert-dialog-description">
                Klarte ikke å hente samtykkeerklæring fra databasen :(
            </DialogContentText>
        );

        const listDoneLoadingContent = (
            this.state.retrieved
                ? termsOfService
                : noTermsOfServiceFound
        );

        const listLoadingContent = (
            <DialogContentText id="alert-dialog-description">
                Henter samtykkeerklæring fra databasen...
            </DialogContentText>
        );

        const termsOfServiceDialog = (
            <Dialog
                open={this.state.termsOfServiceDialogOpen}
                onClose={this.handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Samtykkeerklæring</DialogTitle>
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
                <Button variant="outlined" onClick={this.handleTermsOfServiceDialogOpen}>Samtykkeerklæring</Button>
                {termsOfServiceDialog}
            </div>
        );
    }
}

export default withStyles(styles)(TermsOfService);
