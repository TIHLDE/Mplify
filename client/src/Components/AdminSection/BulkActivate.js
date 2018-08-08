import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

const styles = theme => ({
  root: {
    textAlign: "center"
  },
  paper: {
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  dropzone: {
    marginLeft: theme.spacing.unit * 6,
    marginRight: theme.spacing.unit * 6,
    marginBottom: theme.spacing.unit * 2,
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
      activating: false,
      activated: false,
    };
  }

  handleRemoveFile = () => {
    this.setState({
      csvFile: null,
      invalidFileType: false
    });
  }

  handleDialogClose = () => {
    this.setState({
      bulkActivateDialogOpen: false,
      csvFile: null,
      invalidFileType: false
    });
  }

  handleBulkActivateDialogOpen = () => {
    this.setState({ bulkActivateDialogOpen: true });
  }

  onDrop(fileArray) {
    if (fileArray.length !== 0) {
      this.setState({
        csvFile: fileArray[0],
        invalidFileType: false
      });
    } else {
      this.setState({
        invalidFileType: true
      });
    }
  }

  handleActivationClick = () => {
    this.postData('http://localhost:8080/api/csv_activate', this.state.csvFile)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        if (result.ok) {
          console.log('yay');
        } else {
          console.log('nay');
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  async postData(endpoint, payload, method = 'POST') {
    const options = {
      method: method,
      headers: {
        'Accept': 'application/csv',
        'Content-Type': 'application/csv'
      },
      body: payload
    };
    const res = await fetch(endpoint, options);
    return res;
  }

  render() {
    const { classes } = this.props;

    const fileNotPresentContent = (
      <div>
        <div className={classes.dropzone}>
          <Dropzone
            onDrop={(file) => this.onDrop(file)}
            accept=".csv"
            multiple={false}
          />
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
            ? <div className={classes.root}><DialogContentText id="alert-dialog-description">Fil lastet opp:</DialogContentText><Chip label={this.state.csvFile.name} className={classes.chip} onDelete={this.handleRemoveFile} /></div>
            : ''
        }
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
            this.state.csvFile
              ? filePresentContent
              : fileNotPresentContent
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleDialogClose} color="primary">
            Avbryt
          </Button>
          <Button onClick={this.handleActivationClick} disabled={this.state.csvFile == null} color="primary" autoFocus>
            Aktiver
          </Button>
        </DialogActions>
      </Dialog>
    );

    return (
      <div>
        <Button variant="contained" color="primary" onClick={this.handleBulkActivateDialogOpen}>Bulk-aktivering</Button>
        {bulkActivateDialog}
      </div>
    );
  }
}

export default withStyles(styles)(BulkActivate);
