import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import AdminApi from "../../Api/AdminApi";
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
    },
    progress: {
        margin: theme.spacing.unit * 2
    }
});

class UpdateTermsOfService extends Component {

    constructor(props) {
        super(props);
        this.state = {
            termsOfServiceDialogOpen: false,
            termsOfService: '',

            updating: false,
            updateSuccess: false,
            updateFailure: false
        };
    }

    componentWillMount() {
        UserApi.getTermsOfService()
            .then(response => response.json())
            .then(result => {
                result.length > 0 && this.setState({
                    termsOfService: result[0].text
                })
            })
    }

    handleTextareaChange = event => {
        this.setState({
            termsOfService: event.target.value
        });
    };

    handleDialogClose = () => {
        this.setState({
            termsOfServiceDialogOpen: false,
        });
    };

    handleTermsOfServiceDialogOpen = () => {
        this.setState({
            termsOfServiceDialogOpen: true,
            updating: false,
            updateFailure: false,
            updateSuccess: false
        });
    };

    handleUpdateTermsOfService = () => {
        this.setState({
            updating: true,
            updateSuccess: false,
            updateFailure: false
        });

        AdminApi.updateTermsOfService(this.state.termsOfService)
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
    };

    render() {
        const { classes } = this.props;

        const termsOfServiceInput = (
            <textarea id="terms_of_service_input"
                      value={this.state.termsOfService}
                      className={classes.textArea}
                      rows={24}
                      cols={window.innerWidth > 600 ? 60 : 40}
                      onChange={this.handleTextareaChange}
            />
        );

        const termsOfServiceDialog = (
            <Dialog
                open={this.state.termsOfServiceDialogOpen}
                onClose={this.handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Oppdater samtykkeerklæring</DialogTitle>
                <DialogContent>
                    {
                        this.state.updating
                            ? <CircularProgress className={classes.progress} />
                            : (
                                this.state.updateSuccess
                                    ? <DialogContentText>Samtykkeerklæringen ble oppdatert.</DialogContentText>
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
                <Button variant="contained" color="primary" onClick={this.handleTermsOfServiceDialogOpen}>Oppdater samtykkeerklæring</Button>
                {termsOfServiceDialog}
            </div>
        );
    }
}

export default withStyles(styles)(UpdateTermsOfService);
