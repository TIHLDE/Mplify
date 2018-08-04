import { Grid, Paper, TextField, Typography, FormControl, Button, FormHelperText } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';

const styles = theme => ({
    root: {
        textAlign: "center"
    },
    paper: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
});

class LoginPage extends Component {
    constructor() {
        super();
        this.state = {
            submitting: false,
            loginFailed: false,
            username: '',
            password: ''
        };
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

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = event => {
        event.preventDefault();
        this.setState({
            submitting: true,
            loginFailed: false
        });

        const data = {
            username: this.state.username,
            password: this.state.password
        }

        this.postData('http://localhost:8080/api/login', data)
            .then(response => response.json())
            .then(result => {
                console.log(result);
                if (result.token) {
                    sessionStorage.setItem('token', result.token);
                    this.setState({ 
                        submitting: false
                    });
                    this.setLoggedIn();
                } else {
                    this.setState({
                        submitting: false,
                        loginFailed: true
                    });
                }
            })
            .catch(error => {
                console.log(error);
            })
    }

    setLoggedIn = () => {
        this.props.onLogIn();
    }

    render() {
        const { classes } = this.props;
        console.log(this.props);
        
        return (
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Typography variant="headline" component="h3">Innlogging for SALT-styret</Typography>
                    <hr />
                    <form onSubmit={this.handleSubmit}>
                        <Grid container spacing={8}>
                            <Grid item xs={12}>
                                <TextField
                                    id="username"
                                    name="username"
                                    type="text"
                                    label="Brukernavn:"
                                    className={classes.formControl}
                                    onChange={this.handleChange}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="password"
                                    name="password"
                                    type="password"
                                    label="Passord:"
                                    className={classes.formControl}
                                    onChange={this.handleChange}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl className={classes.formControl} >
                                    <Button
                                        size="large"
                                        variant="contained"
                                        color="primary"
                                        disabled={
                                            this.state.submitting
                                            || this.state.username === ''
                                            || this.state.password === ''
                                        }
                                        type="submit"
                                    >
                                        Logg inn
                                    </Button>
                                    <Button
                                        size="large"
                                        variant="contained"
                                        color="secondary"
                                        onClick={this.setLoggedIn.bind(this)}
                                    >
                                        Logg inn
                                    </Button>
                                    <FormHelperText>{this.state.submitting ? 'Logger inn...' : (this.state.loginFailed ? 'Innlogging mislyktes' : '')}</FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(LoginPage);
