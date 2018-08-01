import { Button, Checkbox, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, Typography, Paper } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from "react";
import { UserData } from "../../Models/UserData";
import { Redirect } from 'react-router-dom';

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
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2
    }
});

class UserRegistrationForm extends Component {

    years = [];

    studentEmailError = false;
    vippsFormatError = false;

    constructor() {
        super();

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

            studyProgrammes: [],

            submitting: false,
            redirect: false,
        };        
    }

    componentWillMount() {
        this.populateStudyProgrammeEntries();
        this.populateYearOfAdmissionYears();
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

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleCheckboxChange = event => {
        this.setState({ [event.target.name]: event.target.checked });
    }

    handleStudyProgrammeChange = event => {
        const studyProgramme = this.state.studyProgrammes.find(e => e.study_programme_id === event.target.value);
        this.setState({ [event.target.name]: studyProgramme });
    }

    handleSubmit = event => {
        event.preventDefault();
        this.setState({submitting: true});

        this.studentEmailError = !this.isNtnuEmail(this.state.studentEmail);
        this.vippsFormatError = (this.state.vippsTransactionId.length !== 0 && this.state.vippsTransactionId.length !== 10) || (this.state.vippsTransactionId.length !== 0 && !this.isNumber(this.state.vippsTransactionId));

        this.forceUpdate();
        if (!this.studentEmailError && !this.vippsFormatError) {
            const data = new UserData();
            data.firstName = this.state.firstName;
            data.lastName = this.state.lastName;
            data.studentEmail = this.state.studentEmail;
            data.privateEmail = this.state.privateEmail;
            data.yearOfAdmission = this.state.yearOfAdmission;
            data.newsletter = this.state.wantNewsletter;
            data.vippsTransactionId = this.state.vippsTransactionId;
            data.studyProgrammeId = this.state.studyProgramme.study_programme_id;

            this.postData('http://localhost:8080/api/register', data)
                .then(response => {
                    console.log(response);
                    if (response.ok) {
                        this.setState({redirect: true});
                    } else {
                        this.setState({submitting: false});
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        }
        this.setState({submitting: false});
    }

    populateStudyProgrammeEntries() {
        this.getData('http://localhost:8080/api/get_all_studyprograms')
            .then(data => {
                const studyProgrammeList = [];                
                data.forEach(studyProgramme => studyProgrammeList.push(studyProgramme));
                this.setState({ studyProgrammes: studyProgrammeList });
            })
            .catch(error => {
                console.log(error);
            });
    }

    populateYearOfAdmissionYears() {
        const amountOfYears = 5;
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < amountOfYears; i++) {
            this.years.push(currentYear - i);
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

        if (!res.ok) {
            throw new Error(res.status); // 404
        }

        const data = await res.json();
        return data;
    }

    async postData(endpoint, payload) {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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
                    <Typography variant="headline" component="h3">Registrering</Typography>
                    <form onSubmit={this.handleSubmit}>
                        <Grid container spacing={8}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="first_name"
                                    name="firstName"
                                    type="text"
                                    label="Fornavn:"
                                    className={classes.formControl}
                                    onChange={this.handleChange}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="last_name"
                                    name="lastName"
                                    type="text"
                                    label="Etternavn:"
                                    className={classes.formControl}
                                    onChange={this.handleChange}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="student_email"
                                    name="studentEmail"
                                    type="email"
                                    label="Student-epost:"
                                    className={classes.formControl}
                                    onChange={this.handleChange}
                                    margin="normal"
                                    helperText="Må inneholde @stud.ntnu.no"
                                    error={this.studentEmailError}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="private_email"
                                    name="privateEmail"
                                    type="email"
                                    label="Privat epost:"
                                    className={classes.formControl}
                                    onChange={this.handleChange}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl className={classes.formControl} >
                                    <InputLabel htmlFor="study-programme" shrink={this.state.studyProgramme.study_programme_id !== -1}>Studieprogram:</InputLabel>
                                    <Select
                                        value={this.state.studyProgramme.study_programme_id}
                                        onChange={this.handleStudyProgrammeChange}
                                        inputProps={{
                                            name: 'studyProgramme',
                                            id: 'study-programme',
                                        }}
                                        className={classes.selectEmpty}
                                    >
                                        {
                                            this.state.studyProgrammes.map(
                                                sp => <MenuItem key={sp.study_programme_id} value={sp.study_programme_id}>{sp.programme_code}</MenuItem>
                                            )
                                        }
                                    </Select>
                                    <FormHelperText>{this.state.studyProgramme.name}</FormHelperText>
                                    <FormHelperText>
                                        {
                                            this.state.studyProgramme.length > 0
                                                ? 'Lengde: ' + this.state.studyProgramme.length + ' år'
                                                : ''
                                        }
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl className={classes.formControl} >
                                    <InputLabel htmlFor="year-of-admission">Opptaksår:</InputLabel>
                                    <Select
                                        value={this.state.yearOfAdmission}
                                        onChange={this.handleChange}
                                        inputProps={{
                                            name: 'yearOfAdmission',
                                            id: 'year-of-admission',
                                        }}
                                        className={classes.selectEmpty}
                                    >
                                        {
                                            this.years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)
                                        }
                                    </Select>
                                    <FormHelperText>Året du begynte på studiet</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="vipps_transaction_id"
                                    name="vippsTransactionId"
                                    type="text"
                                    label="Vipps transaksjons-id:"
                                    className={classes.formControl}
                                    onChange={this.handleChange}
                                    margin="normal"
                                    helperText={this.vippsFormatError ? "Må bestå av 10 siffer" : "Ikke påkrevd"}
                                    error={this.vippsFormatError}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InputLabel>Nyhetsbrev:</InputLabel>
                                <Checkbox name="wantNewsletter" onChange={this.handleCheckboxChange} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InputLabel>Terms of service:</InputLabel>
                                <Checkbox name="acceptTermsOfService" onChange={this.handleCheckboxChange} />
                            </Grid>
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

export default withStyles(styles)(UserRegistrationForm);