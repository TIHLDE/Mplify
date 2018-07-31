import { Button, Checkbox, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, Typography, Paper } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from "react";
import { UserData } from "../../Models/UserData";

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

    studyProgrammes = []
    years = [];

    studentEmailError = false;

    constructor() {
        super();

        this.state = {
            firstName: '',
            lastName: '',
            studentEmail: '',
            privateEmail: '',
            studyProgramme: { id: -1, programmeCode: '', name: '', length: 0 },
            yearOfAdmission: '',
            vippsTransactionId: '',
            wantNewsletter: false,
            acceptTermsOfService: false
        };

        this.populateStudyProgrammeEntries();
        this.populateYearOfAdmissionYears();
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleCheckboxChange = event => {
        this.setState({ [event.target.name]: event.target.checked });
    }

    handleStudyProgrammeChange = event => {
        const studyProgramme = this.studyProgrammes.find(e => e.id === event.target.value);
        this.setState({ [event.target.name]: studyProgramme });
    }

    handleSubmit = event => {
        event.preventDefault();
        this.studentEmailError = !this.isNtnuEmail(this.state.studentEmail);
        this.forceUpdate();
        if (!this.studentEmailError) {
            const data = new UserData();
            data.firstName = this.state.firstName;
            data.lastName = this.state.lastName;
            data.studentEmail = this.state.studentEmail;
            data.privateEmail = this.state.privateEmail;
            data.yearOfAdmission = this.state.yearOfAdmission;
            data.newsletter = this.state.wantNewsletter;
            data.vippsTransactionId = this.state.vippsTransactionId;
            data.studyProgrammeId = this.state.studyProgramme.id;
            console.log(dat5a);

            (async () => {
                const rawResponse = await fetch(
                    'http://localhost:8080/api/register',
                    {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    }
                );
                const content = await rawResponse.json();
                console.log(content);
            })();

        }
    }

    populateStudyProgrammeEntries() {
        this.studyProgrammes.push({ id: 1, programmeid: 'MGLU1-7', name: 'Grunnskolelærerutdanning 1.–7. trinn', length: 5 });
        this.studyProgrammes.push({ id: 2, programmeid: 'LTMAGMA1', name: 'Matematikkdidaktikk 1.–7. trinn', length: 3 });
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
                                    <InputLabel htmlFor="study-programme" shrink={this.state.studyProgramme.id !== -1}>Studieprogram:</InputLabel>
                                    <Select
                                        value={this.state.studyProgramme.id}
                                        onChange={this.handleStudyProgrammeChange}
                                        inputProps={{
                                            name: 'studyProgramme',
                                            id: 'study-programme',
                                        }}
                                        className={classes.selectEmpty}
                                    >
                                        {
                                            this.studyProgrammes.map(
                                                sp => <MenuItem key={sp.id} value={sp.id}>{sp.programmeid}</MenuItem>
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
                                    helperText="Ikke påkrevd"
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
                                            !this.state.acceptTermsOfService
                                            || this.state.firstName === ''
                                            || this.state.lastName === ''
                                            || this.state.studentEmail === ''
                                            || this.state.privateEmail === ''
                                            || this.state.studyProgramme.id === -1
                                            || this.state.yearOfAdmission === ''
                                        }
                                        type="submit"
                                    >
                                        Registrer
                                </Button>
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