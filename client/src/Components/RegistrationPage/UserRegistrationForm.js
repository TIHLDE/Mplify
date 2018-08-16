import { Checkbox, FormControl, FormHelperText, Grid, Input, InputAdornment, InputLabel, MenuItem, Select, TextField } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from "react";
import TermsOfService from "./TermsOfService";
import VippsInfo from "./VippsInfo";

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

    constructor() {
        super();

        this.state = {
            years: [],
            studyProgrammes: [],

            firstName: '',
            lastName: '',
            studentEmail: '',
            privateEmail: '',
            studyProgramme: { study_programme_id: -1, programme_code: '', name: '', length: 0 },
            yearOfAdmission: '',
            vippsTransactionId: '',
            wantNewsletter: false,
            acceptTermsOfService: false,
        };
    }

    componentWillMount() {
        console.log(this.props);

        this.populateStudyProgrammeEntries();
        this.populateYearOfAdmissionYears();

        if (this.props.userToEdit) {
            const u = this.props.userToEdit;
            console.log(u);            
            
            this.setState({
                firstName: u.first_name,
                lastName: u.last_name,
                studentEmail: u.student_email,
                privateEmail: u.private_email,
                studyProgramme: { study_programme_id: u.study_programme_id, programme_code: '', name: '', length: 0 },
                yearOfAdmission: u.year_of_admission,
                vippsTransactionId: u.vipps_transaction_id || '',
                wantNewsletter: u.newsletter === 1,
                acceptTermsOfService: true,
            });
        }
    }

    onTextChange = event => {
        this.setState({ [event.target.name]: event.target.value });
        this.props.onTextChange(event);
    };

    onCheckboxChange = event => {
        this.setState({ [event.target.name]: event.target.checked });
        this.props.onCheckboxChange(event);        
    }

    onStudyProgrammeChange = event => {
        const studyProgramme = this.state.studyProgrammes.find(e => e.study_programme_id === event.target.value);
        this.setState({ [event.target.name]: studyProgramme });
        this.props.onStudyProgrammeChange(event, studyProgramme);
    }

    populateStudyProgrammeEntries() {
        this.getData('/api/get_all_studyprograms')
            .then(response => response.json())
            .then(data => {
                const studyProgrammeList = [];
                data.forEach(studyProgramme => studyProgrammeList.push(studyProgramme));
                this.setState({ studyProgrammes: studyProgrammeList });

                if (this.state.studyProgramme.study_programme_id > 0) {
                    this.setState({
                        studyProgramme: studyProgrammeList.find(sp => sp.study_programme_id === this.state.studyProgramme.study_programme_id)
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    populateYearOfAdmissionYears() {
        const amountOfYears = 5;
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < amountOfYears; i++) {
            years.push(currentYear - i);
        }
        this.setState({
            years: years
        });
    }

    async getData(endpoint) {
        const res = await fetch(endpoint);
        return res;
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Grid container spacing={8}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="first_name"
                            name="firstName"
                            type="text"
                            value={this.state.firstName}
                            label="Fornavn:"
                            className={classes.formControl}
                            onChange={this.onTextChange}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="last_name"
                            name="lastName"
                            type="text"
                            value={this.state.lastName}
                            label="Etternavn:"
                            className={classes.formControl}
                            onChange={this.onTextChange}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="student_email"
                            name="studentEmail"
                            type="email"
                            value={this.state.studentEmail}
                            label="Student-epost:"
                            className={classes.formControl}
                            onChange={this.onTextChange}
                            margin="normal"
                            helperText="Må inneholde @stud.ntnu.no"
                            error={this.props.studentEmailError}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="private_email"
                            name="privateEmail"
                            type="email"
                            value={this.state.privateEmail}
                            label="Privat epost:"
                            className={classes.formControl}
                            onChange={this.onTextChange}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl className={classes.formControl} >
                            <InputLabel htmlFor="study-programme" shrink={this.state.studyProgramme.study_programme_id !== -1}>Studieprogram:</InputLabel>
                            <Select
                                value={this.state.studyProgramme.study_programme_id}
                                onChange={this.onStudyProgrammeChange}
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
                                onChange={this.onTextChange}
                                inputProps={{
                                    name: 'yearOfAdmission',
                                    id: 'year-of-admission',
                                }}
                                className={classes.selectEmpty}
                            >
                                {
                                    this.state.years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)
                                }
                            </Select>
                            <FormHelperText>Året du begynte på studiet</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl
                            className={classes.formControl}
                            aria-describedby="vipps_helper_text"
                            error={this.props.vippsFormatError || this.props.vippsNotUniqueError}>
                            <InputLabel htmlFor="vipps_transaction_id">Vipps transaksjons-id:</InputLabel>
                            <Input
                                id="vipps_transaction_id"
                                name="vippsTransactionId"
                                type="text"
                                value={this.state.vippsTransactionId}
                                onChange={this.onTextChange}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <VippsInfo />
                                    </InputAdornment>
                                }
                            />
                            <FormHelperText id="vipps_helper_text">
                                {
                                    this.props.vippsFormatError
                                        ? 'Må bestå av 10 siffer'
                                        : (
                                            this.props.vippsNotUniqueError
                                                ? 'Koden er allerede i bruk'
                                                : 'Ikke påkrevd'
                                        )
                                }
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InputLabel>Nyhetsbrev/Klypa:</InputLabel>
                        <Checkbox name="wantNewsletter" checked={this.state.wantNewsletter} onChange={this.onCheckboxChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TermsOfService />
                        <InputLabel>Jeg aksepterer:</InputLabel>
                        <Checkbox name="acceptTermsOfService" checked={this.state.acceptTermsOfService} onChange={this.onCheckboxChange} />
                    </Grid>
                </Grid>
            </div>
        );
    }
}
export default withStyles(styles)(UserRegistrationForm);
