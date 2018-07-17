import React, { Component } from "react";
import { Button, InputLabel, Grid, Checkbox, Select, MenuItem, FormControl, Typography, TextField } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 200
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2
    },
});

class UserRegistrationForm extends Component {

    state = {
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

    studyProgrammes = [
        {id: 1, programmecode: 'MGLU1-7', name: 'Grunnskolelærerutdanning 1.–7. trinn', length: 5},
        {id: 2, programmecode: 'LTMAGMA1', name: 'Matematikkdidaktikk 1.–7. trinn', length: 3}
    ]
    years = [];

    constructor() {
        super();

        const amountOfYears = 5;
        const currentYear = new Date().getFullYear();
        for(let i = 0; i < amountOfYears; i++) {
            this.years.push(currentYear-i);
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

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Typography variant="title">Registrering</Typography>
                <form>
                    <Grid container spacing={8}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="first_name"
                                name="firstName"
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
                                label="Student-epost:"
                                className={classes.formControl}
                                onChange={this.handleChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="private_email"
                                name="privateEmail"
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
                                >
                                    Registrer
                                </Button>
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>
            </div>
        );
    }

}

export default withStyles(styles)(UserRegistrationForm);