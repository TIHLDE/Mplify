import React, { Component } from "react";
import { Button, Input, InputLabel, Grid, Checkbox, Select, MenuItem, FormControl, Typography } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 180,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
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

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Typography variant="title">Registrering</Typography>
                <form>
                    <Grid container spacing={8}>
                        <Grid item xs={6}>
                            <FormControl className={classes.formControl} >
                                <InputLabel>Fornavn:</InputLabel>
                                <Input />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl className={classes.formControl} >
                                <InputLabel>Etternavn:</InputLabel>
                                <Input />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl className={classes.formControl} >
                                <InputLabel>Student-epost:</InputLabel>
                                <Input />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl className={classes.formControl} >
                                <InputLabel>Privat epost:</InputLabel>
                                <Input />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl className={classes.formControl} >
                                <InputLabel htmlFor="study-programme">Studieprogram</InputLabel>
                                <Select
                                    value={this.state.studyProgramme}
                                    onChange={this.handleChange}
                                    inputProps={{
                                        name: 'studyProgramme',
                                        id: 'study-programme',
                                    }}
                                    className={classes.selectEmpty}
                                >
                                    <MenuItem value={0}>MGLU1-7 - Grunnskolelærerutdanning 1.–7. trinn</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl className={classes.formControl} >
                                <InputLabel htmlFor="year-of-admission">
                                    Opptaksår
                        </InputLabel>
                                <Select
                                    value={this.state.yearOfAdmission}
                                    onChange={this.handleChange}
                                    inputProps={{
                                        name: 'yearOfAdmission',
                                        id: 'year-of-admission',
                                    }}
                                    className={classes.selectEmpty}
                                >
                                    <MenuItem value={2018}>2018</MenuItem>
                                    <MenuItem value={2017}>2017</MenuItem>
                                    <MenuItem value={2016}>2016</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl} >
                                <InputLabel>Vipps transaksjonskode:</InputLabel>
                                <Input />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <div>
                                <InputLabel>Nyhetsbrev:</InputLabel>
                                <Checkbox />
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <div>
                                <InputLabel>Terms of service:</InputLabel>
                                <Checkbox />
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl} >
                                <Button variant="contained" color="primary">
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