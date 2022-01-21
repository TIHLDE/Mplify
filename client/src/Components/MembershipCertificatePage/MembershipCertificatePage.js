import {Button, FormControl, FormHelperText, Grid, Paper, TextField, Typography} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import React, {Component} from 'react';
import UserApi from "../../Api/UserApi";
import MemberBoard from "./MemberBoard";

const styles = theme => ({
    root: {
        textAlign: "center"
    },
    paper: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        maxWidth: 600,
        marginLeft: "auto",
        marginRight: "auto",
    },
});

class MembershipCertificatePage extends Component {
    constructor(props) {
        super(props);
        this.defaultMember = {user_id: -1, first_name: '', last_name: ''};
        this.state = {
            member: this.defaultMember,
            submitting: false,
            loginFailed: false,
            studentEmail: '',
        };
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

        UserApi.checkUser(this.state.studentEmail)
            .then(response => response.json())
            .then(result => {
                if (result) {
                    this.setState({
                        member: result,
                        submitting: false
                    });
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
    };

    clearMember = () => {
        this.setState({
            member: this.defaultMember,
            studentEmail: ''
        })
    };

    render() {
        const { classes } = this.props;

        const inputContent = (
            <form onSubmit={this.handleSubmit}>
                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <TextField
                            id="student_email"
                            name="studentEmail"
                            type="text"
                            label="Studentepost:"
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
                                    || this.state.studentEmail === ''
                                }
                                type="submit"
                            >
                                Sjekk medlem
                            </Button>
                            <FormHelperText>{this.state.submitting ? 'Sjekker medlem...' : (this.state.loginFailed ? 'Fant ikke medlem' : '')}</FormHelperText>
                        </FormControl>
                    </Grid>
                </Grid>
            </form>
        );

        const outputContent = (
            <div>
                <MemberBoard member={this.state.member} />
                <Button
                    size="large"
                    variant="contained"
                    color="secondary"
                    onClick={this.clearMember}
                >
                    Gå tilbake
                </Button>
            </div>
        );

        return (
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Typography variant="h5" component="h3">Medlemsbevis</Typography>
                    <hr />
                    {this.state.member.user_id > 0 ? outputContent : inputContent}
                </Paper>

            </div>
        );
    }
}

export default withStyles(styles)(MembershipCertificatePage);
