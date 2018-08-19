import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@material-ui/core';
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
    },
    progress: {
        margin: theme.spacing.unit * 2
    }
});

class UpdateTermsOfService extends Component {

    constructor() {
        super();
        this.state = {
            termsOfServiceDialogOpen: false,
            termsOfService: '',

            updating: false,
            updateSuccess: false,
            updateFailure: false
        };
    }

    handleTextareaChange = event => {
        this.setState({
            termsOfService: event.target.value
        });
    }

    handleDialogClose = () => {
        this.setState({
            termsOfServiceDialogOpen: false,
        });
    }

    handleTermsOfServiceDialogOpen = () => {
        this.setState({
            termsOfServiceDialogOpen: true,
            updating: false,
            updateFailure: false,
            updateSuccess: false
        });
    }

    handleUpdateTermsOfService = () => {
        this.setState({
            updating: true,
            updateSuccess: false,
            updateFailure: false
        });

        const data = {
            termsOfService: this.state.termsOfService
        }

        this.putData('/api/update_terms_of_service', data)
            .then(response => {
                if (response.ok) {
                    this.setState({
                        updating: false,
                        updateSuccess: true
                    });
                } else {
                    this.setState({
                        updating: false,
                        updateFailure: true
                    });
                }
            })
            .catch(error => {
                console.log(error);
                this.setState({
                    updating: false,
                    updateFailure: true
                });
            })
    }

    async putData(endpoint, payload) {
        const options = {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-Token': sessionStorage.getItem('token')
            },
            body: JSON.stringify(payload)
        };
        const res = await fetch(endpoint, options);
        return res;
    }

    render() {
        const { classes } = this.props;

        const termsOfServiceInput = (
            <textarea id="terms_of_service_input" className={classes.textArea} rows={24} cols={window.innerWidth > 600 ? 60 : 40} onChange={this.handleTextareaChange}></textarea>
        );

        const termsOfServiceDialog = (
            <Dialog
                open={this.state.termsOfServiceDialogOpen}
                onClose={this.handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Oppdater Terms of Service</DialogTitle>
                <DialogContent>
                    {
                        this.state.updating
                            ? <CircularProgress className={classes.progress} />
                            : (
                                this.state.updateSuccess
                                    ? <DialogContentText>Terms of Service ble oppdatert.</DialogContentText>
                                    : (
                                        this.state.updateFailure
                                            ? <DialogContentText>Oppdatering mislyktes :( prøv igjen senere</DialogContentText>
                                            : termsOfServiceInput
                                    )
                            )
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleDialogClose} color="primary">Lukk</Button>
                    <Button onClick={this.handleUpdateTermsOfService} color="primary" disabled={!this.state.termsOfService || this.state.updating || this.state.updateSuccess || this.state.updateFailure}>Oppdater</Button>
                </DialogActions>
            </Dialog>
        );

        return (
            <div>
                <Button variant="contained" color="primary" onClick={this.handleTermsOfServiceDialogOpen}>Oppdater Terms of Service</Button>
                {termsOfServiceDialog}
            </div>
        );
    }
}

export default withStyles(styles)(UpdateTermsOfService);
