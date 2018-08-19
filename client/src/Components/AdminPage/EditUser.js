import { Button, FormControl, FormHelperText, Grid, Paper, Typography } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from "react";
import { UserData } from "../../Models/UserData";
import UserRegistrationForm from "../RegistrationPage/UserRegistrationForm";
const styles = theme => ({
    root: {
        textAlign: "center"
    },
    paper: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    formControl: {
        textAlign: "left",
        margin: theme.spacing.unit,
        minWidth: 200
    }
});

class EditUser extends Component {

    constructor() {
        super();

        this.state = {
            userId: '',
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
            updateFailure: false,
            updateSuccess: false,
            redirect: false,
        };
    }

    componentWillMount() {
        const u = this.props.userToEdit;
        this.setState({
            userId: u.user_id,
            firstName: u.first_name,
            lastName: u.last_name,
            studentEmail: u.student_email || '',
            privateEmail: u.private_email,
            studyProgramme: { study_programme_id: u.study_programme_id },
            yearOfAdmission: u.year_of_admission,
            vippsTransactionId: u.vipps_transaction_id || '',
            wantNewsletter: u.newsletter,
            acceptTermsOfService: true
        });
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
            vippsNotUniqueError: false,
            updateFailure: false,
            updateSuccess: false
        });

        let allowSubmit = true;

        if (!this.isNtnuEmail(this.state.studentEmail)) {
            allowSubmit = false;
            this.setState({
                studentEmailError: true
            });
        }

        if ((this.state.vippsTransactionId.length !== 0 && this.state.vippsTransactionId.length !== 10)
            || (this.state.vippsTransactionId.length !== 0 && !this.isNumber(this.state.vippsTransactionId))) {
            allowSubmit = false;
            this.setState({
                vippsFormatError: true
            });
        }

        if (!this.state.vippsFormatError && this.state.vippsTransactionId) {
            const url = 'http://localhost:8080/api/check_vipps_transaction_id/' + this.state.vippsTransactionId + '?user_id=' + this.props.userToEdit.user_id
            const vippsUniqueResponse = await this.getData(url);
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
            data.userId = this.state.userId;
            data.firstName = this.state.firstName;
            data.lastName = this.state.lastName;
            data.studentEmail = this.state.studentEmail;
            data.privateEmail = this.state.privateEmail;
            data.yearOfAdmission = this.state.yearOfAdmission;
            data.newsletter = this.state.wantNewsletter;
            data.vippsTransactionId = this.state.vippsTransactionId;
            data.studyProgrammeId = this.state.studyProgramme.study_programme_id;

            this.putData('http://localhost:8080/api/update_member', data)
                .then(response => {
                    if (response.ok) {
                        this.setState({
                            updateSuccess: true
                        });
                    } else {
                        this.setState({
                            updateFailure: true
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                    this.setState({
                        updateFailure: true
                    });
                })
                .finally(() => {
                    this.setState({
                        submitting: false
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

        return (
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Typography variant="headline" component="h3">{'Oppdatering av medlem #' + this.props.userToEdit.user_id + ': ' + this.props.userToEdit.first_name + ' ' + this.props.userToEdit.last_name}</Typography>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <UserRegistrationForm
                            userToEdit={this.props.userToEdit}

                            onTextChange={this.handleTextChange.bind(this)}
                            onCheckboxChange={this.handleCheckboxChange.bind(this)}
                            onStudyProgrammeChange={this.handleStudyProgrammeChange.bind(this)}

                            studentEmailError={this.state.studentEmailError}
                            vippsFormatError={this.state.vippsFormatError}
                            vippsNotUniqueError={this.state.vippsNotUniqueError}
                        />
                        <Grid container spacing={8}>
                            <Grid item xs={6}>
                                <FormControl className={classes.formControl} >
                                    <Button
                                        size="large"
                                        variant="contained"
                                        color="secondary"
                                        onClick={this.props.onStopEditingUser}
                                    >
                                        Gå tilbake
                                    </Button>
                                    <FormHelperText>
                                        Ulagrede endringer vil bli forkastet
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
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
                                        Oppdater
                                    </Button>
                                    <FormHelperText>
                                        {
                                            this.state.submitting
                                                ? 'Oppdaterer info...'
                                                : (
                                                    this.state.updateSuccess
                                                        ? 'Bruker oppdatert'
                                                        : (
                                                            this.state.updateFailure
                                                                ? 'Oppdatering feilet'
                                                                : ''
                                                        )
                                                )
                                        }
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </div>
        );
    }
}
export default withStyles(styles)(EditUser);
