import React, { Component } from "react";
import { Button, InputLabel, Grid, Paper, Checkbox, Select, MenuItem, FormControl, Typography, TextField } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        textAlign: "center"
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 200
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2
    },
    paper: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    }
});

class UserRegistrationForm extends Component {

    studyProgrammes = [
        { id: 1, programmecode: 'MGLU1-7', name: 'Grunnskolelærerutdanning 1.–7. trinn', length: 5 },
        { id: 2, programmecode: 'LTMAGMA1', name: 'Matematikkdidaktikk 1.–7. trinn', length: 3 }
    ]
    years = [];

    studentEmailError = false;

    constructor() {
        super();

        this.state = {
            firstName: '',
            lastName: '',
            studentEmail: '',
            privateEmail: '',
            studyProgramme: '',
            yearOfAdmission: '',
            vippsTransactionCode: '',
            wantNewsletter: false,
            acceptTermsOfService: false
        };

        const amountOfYears = 5;
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < amountOfYears; i++) {
            this.years.push(currentYear - i);
        }
    }

    handleChange = event => {
        if (event.target.name !== 'wantNewsletter' && event.target.name !== 'acceptTermsOfService') {
            console.log('value updated');
            this.setState({ [event.target.name]: event.target.value });
        } else {
            console.log('checkbox updated');
            this.setState({ [event.target.name]: event.target.checked });
        }
    };

    handleSubmit = event => {
        this.studentEmailError = !this.isNtnuEmail(this.state.studentEmail);
        
        console.log(event);
        
        this.forceUpdate();
        event.preventDefault();
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
                                    <InputLabel htmlFor="study-programme">Studieprogram:</InputLabel>
                                    <Select
                                        value={this.state.studyProgramme}
                                        onChange={this.handleChange}
                                        inputProps={{
                                            name: 'studyProgramme',
                                            id: 'study-programme',
                                        }}
                                        className={classes.selectEmpty}
                                    >
                                        {
                                            this.studyProgrammes.map(
                                                sp => <MenuItem key={sp.id} value={sp.id}>{sp.programmecode}</MenuItem>
                                            )
                                        }

                                    </Select>
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
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="vipps_transaction_code"
                                    name="vippsTransactionCode"
                                    type="text"
                                    label="Vipps transaksjonskode:"
                                    className={classes.formControl}
                                    onChange={this.handleChange}
                                    margin="normal"
                                    helperText="Ikke påkrevd"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InputLabel>Nyhetsbrev:</InputLabel>
                                <Checkbox name="wantNewsletter" onChange={this.handleChange} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InputLabel>Terms of service:</InputLabel>
                                <Checkbox name="acceptTermsOfService" onChange={this.handleChange} />
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
                                            || this.state.studyProgramme === ''
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