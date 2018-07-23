import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import UserRegistrationForm from '../UserRegistrationForm/UserRegistrationForm';

const styles = theme => ({
    root: {
        textAlign: "center"
    }
});

class AdminSection extends Component {
    constructor() {
        super();
        this.state = {};
    }

    componentWillMount() {
        console.log('Admin section will mount');
    }

    componentDidMount() {
        console.log('Admin section did mount');
    }

    render() {
        const { classes } = this.props;

        return (
            <div className="App">
                <div className={classes.root}>
                    <Typography variant="headline" component="h3">Admin-panel</Typography>
                    <hr />
                    <UserRegistrationForm />
                    <hr />
                    <Typography variant="headline" component="h3">Her kommer liste over brukere</Typography>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(AdminSection);
