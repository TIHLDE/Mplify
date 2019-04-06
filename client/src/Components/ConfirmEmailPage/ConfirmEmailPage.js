import { Paper, Typography } from '@material-ui/core';
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
        maxWidth: 600,
        marginLeft: "auto",
        marginRight: "auto",
    },
});

class ConfirmEmailPage extends Component {
    constructor() {
        super();
        this.state = {
            processing: true,
            verified: false
        };
    }

    componentWillMount() {
        UserApi.confirmEmail(this.props.match.params.code)
            .then(response => {
                if (response.ok) {
                    this.setState({ verified: true, processing: false });
                } else {
                    this.setState({ verified: false, processing: false });
                }
            })
            .catch(error => {
                console.log(error);
                this.setState({ verified: false, processing: false });
            });
    }

    async getData(endpoint, payload) {
        const options = {
            method: 'GET'
        };
        const res = await fetch(endpoint, options);
        return res;
    }

    renderContent = () => {
        const { classes } = this.props;
        if (this.state.processing) {
            return (
                <Paper className={classes.paper}>
                    <Typography variant="h5" component="h3">Behandler forespørsel...</Typography>
                    <hr />
                    <p>Vent et lite øyeblikk, dette burde ikke ta lang tid.</p>
                </Paper>
            );
        } else if (this.state.verified) {
            return (
                <Paper className={classes.paper}>
                    <Typography variant="h5" component="h3">Eposten din er nå bekreftet!</Typography>
                    <hr />
                    <p>Du har nå fullført registreringen.</p>
                </Paper>
            );
        } else {
            return (
                <Paper className={classes.paper}>
                    <Typography variant="h5" component="h3">Lenken er ikke gyldig.</Typography>
                    <hr />
                    <p>Dette kan skyldes at koden er ugyldig, eller at eposten din allerede har blitt aktivert.</p>
                </Paper>
            );
        }
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                {this.renderContent()}
            </div>
        );
    }
}

export default withStyles(styles)(ConfirmEmailPage);
