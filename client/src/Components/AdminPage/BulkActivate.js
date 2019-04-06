import {
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import AdminApi from "../../Api/AdminApi";

const styles = theme => ({
    root: {
        textAlign: "center"
    },
    paper: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    dropzone: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: theme.spacing.unit * 2,
    },
    dropzoneBox: {
        width: 100,
        height: 100,
        border: '2px dashed black',
        borderRadius: 4,
    },
    chip: {
        margin: theme.spacing.unit,
    },
});


class BulkActivate extends Component {
    constructor() {
        super();
        this.state = {
            csvFile: null,
            invalidFileType: false,
            bulkActivateDialogOpen: false,
            activationAttempted: false,
            activating: false,
            activated: false,
            amountToBeActivated: -1,
            amountActivated: -1
        };
    }

    handleRemoveFile = () => {
        this.setState({
            csvFile: null,
            invalidFileType: false,
            activationAttempted: false
        });
    };

    handleDialogClose = () => {
        this.setState({
            bulkActivateDialogOpen: false,
        });
    };

    handleBulkActivateDialogOpen = () => {
        this.setState({
            bulkActivateDialogOpen: true,
            csvFile: null,
            invalidFileType: false,
            activationAttempted: false,
            activating: false,
            activated: false,
            amountToBeActivated: -1,
            amountActivated: -1
        });
    };

    onDrop(fileArray) {
        if (fileArray.length !== 0) {
            this.setState(
                {
                    csvFile: fileArray[0],
                    invalidFileType: false
                },
                () => {
                    AdminApi.checkAmountOfUsersToActivate(fileArray[0])
                        .then(response => response.json())
                        .then(result => {
                            this.setState({
                                amountToBeActivated: result.updatableRows
                            });
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }
            );
        } else {
            this.setState({
                invalidFileType: true
            });
        }
    }

    handleActivationClick = () => {

        this.setState({
            activationAttempted: true,
            activating: true,
        });

        AdminApi.bulkActivate(this.state.csvFile)
            .then(response => response.json())
            .then(result => {
                const amountActivated = parseInt(result[1].updatedRows, 10);
                if (amountActivated > 0) {
                    this.setState({
                        activated: true,
                        amountActivated: amountActivated
                    });
                } else {
                    this.setState({
                        activated: false
                    });
                }
            })
            .catch(err => {
                console.log(err);
                this.setState({
                    activated: false
                });
            })
            .finally(() => {
                this.setState({
                    activating: false
                });
            });
    };

    render() {
        const {classes} = this.props;

        const fileNotPresentContent = (
            <div>
                <div className={classes.dropzone}>
                    <Dropzone
                        onDrop={(file) => this.onDrop(file)}
                        accept=".csv"
                        multiple={false}
                    >
                        {({getRootProps, getInputProps}) => (
                            <div {...getRootProps()} className={classes.dropzoneBox}>
                                <input {...getInputProps()} />
                            </div>
                        )}
                    </Dropzone>
                </div>
                <DialogContentText id="alert-dialog-description">
                    {
                        this.state.invalidFileType
                            ? 'Filen du lastet opp er ugyldig'
                            : 'Dra inn eller trykk for å laste opp .csv-fil'
                    }
                </DialogContentText>
            </div>
        );

        const filePresentContent = (
            <div>
                {
                    this.state.csvFile
                        ? <div className={classes.root}>
                            <DialogContentText id="alert-dialog-description">Fil lastet opp:</DialogContentText>
                            <Chip label={this.state.csvFile.name} className={classes.chip} onDelete={this.handleRemoveFile}/>
                            {
                                this.state.amountToBeActivated >= 0
                                    ? <DialogContentText id="alert-dialog-description">Antall brukere som vil bli aktivert: {this.state.amountToBeActivated}</DialogContentText>
                                    : <div><CircularProgress size={30}/></div>
                            }
                        </div>
                        : 'Noe gikk galt. Vennligst prøv igjen.'
                }
            </div>
        );

        const preActivation = (
            this.state.csvFile
                ? filePresentContent
                : fileNotPresentContent
        );

        const userFeedback = (
            this.state.activating
                ? <CircularProgress/>
                : (
                    this.state.activated
                        ? <DialogContentText>Det ble
                            aktivert {this.state.amountActivated > 0 ? this.state.amountActivated : 0} bruker{this.state.amountActivated === 1 ? '' : 'e'}.</DialogContentText>
                        : <DialogContentText>Ingen brukere ble aktivert.</DialogContentText>
                )
        );

        const postActivation = (
            <div>
                {!this.state.activated ? preActivation : ''}
                {userFeedback}
            </div>
        );

        const bulkActivateDialog = (
            <Dialog
                open={this.state.bulkActivateDialogOpen}
                onClose={this.handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Aktiver medlemmer med csv-fil</DialogTitle>
                <DialogContent>
                    {
                        this.state.activationAttempted
                            ? postActivation
                            : preActivation
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleDialogClose} color="primary">
                        Avbryt
                    </Button>
                    <Button
                        onClick={this.handleActivationClick}
                        disabled={
                            this.state.csvFile == null
                            || this.state.activationAttempted
                        }
                        color="primary"
                        autoFocus
                    >
                        Aktiver
                    </Button>
                </DialogActions>
            </Dialog>
        );

        return (
            <div>
                <Button variant="contained" color="primary"
                        onClick={this.handleBulkActivateDialogOpen}>Bulk-aktivering</Button>
                {bulkActivateDialog}
            </div>
        );
    }
}

export default withStyles(styles)(BulkActivate);
