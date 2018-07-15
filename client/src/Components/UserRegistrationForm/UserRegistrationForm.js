import React, { Component } from "react";
import { Button, Input, InputLabel, Checkbox, Select, MenuItem, FormControl } from "@material-ui/core";

class UserRegistrationForm extends Component {

    state = {
        firstName: '',
        lastName: '',
        studentEmail: '',
        privateEmail: '',
        studyProgramme: '',
        yearOfAdmission: '',
        wantNewsletter: false,
        vippsTransactionCode: ''
    };

    handleChange = event => {        
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        return (
            <div>
                <h2>Registrering</h2>
                <form>
                    <FormControl>
                        <InputLabel>Fornavn:</InputLabel>
                        <Input />
                    </FormControl>
                    <FormControl>
                        <InputLabel>Etternavn:</InputLabel>
                        <Input />
                    </FormControl>
                    <FormControl>
                        <InputLabel>Student-epost:</InputLabel>
                        <Input />
                    </FormControl>
                    <FormControl>
                        <InputLabel>Privat epost:</InputLabel>
                        <Input />
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="study-programme">Studieprogram</InputLabel>
                        <Select
                            value={this.state.studyProgramme}
                            onChange={this.handleChange}
                            inputProps={{
                                name: 'studyProgramme',
                                id: 'study-programme',
                            }}
                        >
                            <MenuItem value={0}>MGLU1-7 - Grunnskolelærerutdanning 1.–7. trinn</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl>
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
                        >
                            <MenuItem value={2018}>2018</MenuItem>
                            <MenuItem value={2017}>2017</MenuItem>
                            <MenuItem value={2016}>2016</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <InputLabel>Vipps transaksjonskode:</InputLabel>
                        <Input />
                    </FormControl>
                    <FormControl>
                        <InputLabel>Nyhetsbrev:</InputLabel>
                        <Checkbox />
                    </FormControl>
                    <FormControl>
                        <InputLabel>Terms of service:</InputLabel>
                        <Checkbox />
                    </FormControl>
                    <FormControl>
                        <Button variant="contained" color="primary">
                            Registrer
                    </Button>
                    </FormControl>
                </form>
            </div>
        );
    }

}

export default UserRegistrationForm;