import { Button, FormControl, FormHelperText, Grid, Paper, Typography } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import { UserData } from "../../Models/UserData";
import UserRegistrationForm from "./UserRegistrationForm";
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
    formControl: {
        textAlign: "left",
        margin: theme.spacing.unit,
        minWidth: 200
    }
});

class RegistrationPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            studentEmail: '',
            privateEmail: '',
            studyProgramme: { study_programme_id: -1, programme_code: '', name: '', length: 0 },
            yearOfAdmission: '',
            vippsTransactionId: '',
            wantNewsletter: false,
            acceptTermsOfService: false,

            studentEmailError: false,
            vippsFormatError: false,
            vippsNotUniqueError: false,

            submitting: false,
            redirect: false,
        };
    }

    setRedirect = () => {
        this.setState({
            redirect: true
        })
    }

    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to='/awaiting-confirmation' />
        }
    }

    handleTextChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleCheckboxChange = event => {
        this.setState({ [event.target.name]: event.target.checked });
    }

    handleStudyProgrammeChange = (event, studyProgramme) => {
        this.setState({ [event.target.name]: studyProgramme });
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({
            studentEmailError: false,
            vippsFormatError: false,
            vippsNotUniqueError: false
        });

        let allowSubmit = true;

        if (!this.isNtnuEmail(this.state.studentEmail)) {
            allowSubmit = false;
            this.setState({
                studentEmailError: true
            });
        }

        if ((this.state.vippsTransactionId.length !== 0 && this.state.vippsTransactionId.length < 9)
            || (this.state.vippsTransactionId.length !== 0 && !this.isNumber(this.state.vippsTransactionId))) {
            allowSubmit = false;
            this.setState({
                vippsFormatError: true
            });
        }

        if (!this.state.vippsFormatError && this.state.vippsTransactionId) {
            const vippsUniqueResponse = await UserApi.checkVippsTransactonId(this.state.vippsTransactionId);
            if (!vippsUniqueResponse.ok) {
                allowSubmit = false;
                this.setState({
                    vippsNotUniqueError: true
                });
            }
        }

        if (allowSubmit) {
            this.setState({
                submitting: true
            });
            const data = new UserData();
            data.firstName = this.state.firstName;
            data.lastName = this.state.lastName;
            data.studentEmail = this.state.studentEmail;
            data.privateEmail = this.state.privateEmail;
            data.yearOfAdmission = this.state.yearOfAdmission;
            data.newsletter = this.state.wantNewsletter;
            data.vippsTransactionId = this.state.vippsTransactionId;
            data.studyProgrammeId = this.state.studyProgramme.study_programme_id;

            let shouldRedirect = false;

            UserApi.registerMember(data)
                .then(response => {
                    if (response.ok) {
                        shouldRedirect = true;
                    }
                })
                .catch(error => {
                    console.log(error);
                })
                .finally(() => {
                    this.setState({
                        submitting: false,
                        redirect: shouldRedirect
                    });
                })
        }
    }

    isNtnuEmail(email) {
        const ntnuStudentEmail = '@stud.ntnu.no';
        return email.trim().substr(email.length - ntnuStudentEmail.length, ntnuStudentEmail.length) === ntnuStudentEmail;
    }

    isNumber(string) {
        return string.match(/^[0-9]+$/) != null;
    }

    async getData(endpoint) {
        const res = await fetch(endpoint);
        return res;
    }
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Typography variant="h5" component="h3">Registrering</Typography>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <UserRegistrationForm
                            onTextChange={this.handleTextChange.bind(this)}
                            onCheckboxChange={this.handleCheckboxChange.bind(this)}
                            onStudyProgrammeChange={this.handleStudyProgrammeChange.bind(this)}

                            studentEmailError={this.state.studentEmailError}
                            vippsFormatError={this.state.vippsFormatError}
                            vippsNotUniqueError={this.state.vippsNotUniqueError}
                        />
                        <Grid container spacing={8}>
                            <Grid item xs={12}>
                                <FormControl className={classes.formControl} >
                                    <Button
                                        size="large"
                                        variant="contained"
                                        color="primary"
                                        disabled={
                                            this.state.submitting
                                            || !this.state.acceptTermsOfService
                                            || this.state.firstName === ''
                                            || this.state.lastName === ''
                                            || this.state.studentEmail === ''
                                            || this.state.privateEmail === ''
                                            || this.state.studyProgramme.study_programme_id === -1
                                            || this.state.yearOfAdmission === ''
                                        }
                                        type="submit"
                                    >
                                        Registrer
                                    </Button>
                                    <FormHelperText>{this.state.submitting ? 'Sender data...' : ''}</FormHelperText>
                                    {this.renderRedirect()}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </div>
        );
    }
}
export default withStyles(styles)(RegistrationPage);
