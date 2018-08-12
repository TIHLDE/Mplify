import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, Paper, Switch, Tooltip, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Clear from '@material-ui/icons/Clear';
import Delete from '@material-ui/icons/Delete';
import Done from '@material-ui/icons/Done';
import Edit from '@material-ui/icons/Edit';
import MUIDataTable from 'mui-datatables';
import React, { Component } from 'react';

const styles = theme => ({
    root: {
        textAlign: "center"
    },
    paper: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    buttonContainer: {
        display: "flex"
    },
    button: {
        display: "inline-flex"
    },
    chip: {
        margin: theme.spacing.unit,
    },
    noWrap: {
        whiteSpace: "nowrap",
        verticalAlign: "50%"
    }
});

class UserDataTable extends Component {

    columns = [
        { name: 'Handlinger', options: { filter: false, display: true, sort: false } },
        {
            name: 'Aktiv',
            options: {
                filter: true,
                display: true,
                customRender: (value, tableMeta, updateValue) => {
                    return (
                        <FormControlLabel
                            label={value ? "Ja" : "Nei"}
                            value={value ? "Ja" : "Nei"}
                            control={
                                <Switch color="primary" checked={value ? true : false} value={value ? "Ja" : "Nei"} />
                            }
                            onChange={event => {
                                const idIndex = this.columns.findIndex(c => c.name === 'ID');
                                const memberAttributes = tableMeta.rowData;
                                const memberId = memberAttributes[idIndex];
                                const member = this.state.members.find(m => m.user_id === memberId);
                                this.handleActivationDialogOpen(member);
                            }}
                        />
                    );

                }
            }
        },
        { name: 'ID', options: { filter: false, display: false } },
        { name: 'Fornavn', options: { filter: false, display: true } },
        { name: 'Etternavn', options: { filter: false, display: true } },
        { name: 'Stud.epost', options: { filter: false, display: true } },
        {
            name: 'Bekreftet epost',
            options: {
                filter: true,
                display: true,
                customRender: (value, tableMeta, updateValue) => {
                    return value === "Ja"
                        ? <Tooltip title="Bekreftet"><Done /></Tooltip>
                        : <Tooltip title="Ikke bekreftet"><Clear /></Tooltip>
                }
            }
        },
        { name: 'Priv.epost', options: { filter: false, display: false } },
        { name: 'Studiestart', options: { filter: true, display: false } },
        {
            name: 'Linje',
            options: {
                filter: true,
                display: true,
                customRender: (value, tableMeta, updateValue) => {
                    const { classes } = this.props;
                    const studyProgramme = this.state.studyProgrammes.find(sp => sp.programme_code === value);
                    const spInfo = value + ' - ' + studyProgramme.name + ' - ' + studyProgramme.length + ' år';
                    return <Chip label={value} className={classes.chip} onClick={this.handleChipClick.bind(this, spInfo)} />;
                }
            }
        },
        { name: 'Nyhetsbrev', options: { filter: true, display: false } },
        { name: 'Vipps', options: { filter: false, display: true } },
    ];

    data = [];

    options = {
        print: false,
        download: false,
        filterType: 'checkbox',
        selectableRows: false,
        textLabels: {
            body: {
                noMatch: "Fant ingen elementer elementer",
                toolTip: "Sortér",
            },
            pagination: {
                next: "Neste side",
                previous: "Forrige side",
                rowsPerPage: "Rader per side:",
                displayRows: "av",
            },
            toolbar: {
                search: "Søk",
                downloadCsv: "Last ned CSV",
                print: "Print",
                viewColumns: "Se kolonner",
                filterTable: "Filtrer tabell",
            },
            filter: {
                all: "Alle",
                title: "FILTERE",
                reset: "TILBAKESTILL",
            },
            viewColumns: {
                title: "Vis kolonner",
                titleAria: "Vis/skjul tabellkolonner",
            },
            selectedRows: {
                text: "rad(er) valgt",
                delete: "Slett",
                deleteAria: "Slett valgt rad",
            },
        }
    };

    constructor() {
        super();
        this.state = {
            loadingMembers: true,
            studyProgrammes: [],
            members: [],
            activationDialogOpen: false,
            deleteDialogOpen: false,
            memberToProcess: {},
        };
    }

    componentWillMount() {
        this.getData('http://localhost:8080/api/get_all_studyprograms')
            .then(data => {
                const studyProgrammeList = [];
                data.forEach(studyProgramme => studyProgrammeList.push(studyProgramme));
                this.setState({ studyProgrammes: studyProgrammeList }, function () {
                    this.fetchMembers();
                })
            })
            .catch(error => {
                console.log(error);
            });
    }

    fetchMembers() {
        this.getData('http://localhost:8080/api/allusers')
            .then(data => {
                const memberList = [];
                data.forEach(member => memberList.unshift(member));
                this.setState({ members: memberList, loadingMembers: false });
            })
            .catch(error => {
                console.log(error);
            });
    }

    handleActivationDialogOpen = (member) => {
        this.setState({
            activationDialogOpen: true,
            memberToProcess: member
        });
    }

    handleDialogClose = () => {
        this.setState({
            activationDialogOpen: false,
            deleteDialogOpen: false
        });
    }

    handleActivationClick = () => {
        const member = this.state.memberToProcess;
        const activate = member.active ? 0 : 1;
        const payload = { userId: member.user_id, active: activate };
        this.postData('http://localhost:8080/api/toggle_active', payload)
            .then(response => {
                if (response.ok) {
                    const updatedMember = member;
                    updatedMember.active = activate === 1;
                    const updatedMemberIndex = this.state.members.findIndex(m => m.user_id === updatedMember.user_id);
                    let updatedMemberList = this.state.members;
                    updatedMemberList.splice(updatedMemberIndex, 1, updatedMember);
                    this.setState({
                        members: updatedMemberList,
                        activationDialogOpen: false
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    handleChipClick = (spInfo) => {
        console.log(spInfo);
        // TODO: Åpne snackbar med info
    }

    handleEditClick = (member) => {
        console.log(member);
    }

    handleDeleteDialogOpen = (member) => {
        this.setState({
            deleteDialogOpen: true,
            memberToProcess: member
        });
    }

    handleDeleteClick = () => {
        const member = this.state.memberToProcess;
        const payload = { userId: member.user_id };
        this.postData('http://localhost:8080/api/delete_member', payload, 'DELETE')
            .then(response => {
                if (response.ok) {
                    const updatedMemberIndex = this.state.members.findIndex(m => m.user_id === member.user_id);
                    let updatedMemberList = this.state.members;
                    updatedMemberList.splice(updatedMemberIndex, 1);
                    this.setState({
                        members: updatedMemberList,
                        deleteDialogOpen: false
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    formatTableRow(m) {
        const { classes } = this.props;

        const editButton = <Tooltip title="Rediger"><IconButton className={classes.button} color="primary" onClick={this.handleEditClick.bind(this, m)}><Edit /></IconButton></Tooltip>;
        const deleteButton = <Tooltip title="Slett"><IconButton className={classes.button} color="secondary" onClick={this.handleDeleteDialogOpen.bind(this, m)}><Delete /></IconButton></Tooltip>;
        const actions = <div className={classes.buttonContainer}>{editButton}{deleteButton}</div>

        const verifiedStudentEmail = m.verified_student_email ? 'Ja' : 'Nei';
        const studyProgramme = this.state.studyProgrammes.find(sp => sp.study_programme_id === m.study_programme_id);
        const studyProgrammeName = studyProgramme != null ? studyProgramme.programme_code : '';
        const newsletter = m.newsletter ? 'Ja' : 'Nei';
        const vippsTransactionId = m.vipps_transaction_id == null ? '' : m.vipps_transaction_id;

        return [actions, m.active, m.user_id, m.first_name, m.last_name, m.student_email, verifiedStudentEmail, m.private_email, m.year_of_admission, studyProgrammeName, newsletter, vippsTransactionId];
    }

    async getData(endpoint) {
        const options = {
            method: 'GET',
            headers: {
                'X-CSRF-Token': sessionStorage.getItem('token')
            }
        };

        const res = await fetch(endpoint, options);

        if (!res.ok) {
            throw new Error(res.status); // 404
        }

        const data = await res.json();
        return data;
    }

    async postData(endpoint, payload, method = 'POST') {
        const options = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-Token': sessionStorage.getItem('token')
            },
            body: JSON.stringify(payload)
        };
        const res = await fetch(endpoint, options);
        return res;
    }

    render() {
        const { classes } = this.props;

        this.data = this.state.members.map(m => this.formatTableRow(m));

        const loadingComponent = (
            <Paper className={classes.paper}>
                <Typography variant="headline" component="h3">Henter medlemmer...</Typography>
            </Paper>
        );

        const dataTable = (
            <MUIDataTable
                title={'Medlemmer'}
                data={this.data}
                columns={this.columns}
                options={this.options}
            />
        );

        return (
            <div className={classes.root}>
                {this.state.loadingMembers ? loadingComponent : dataTable}
                <Dialog
                    open={this.state.activationDialogOpen}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Bekreft handling</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {
                                this.state.memberToProcess
                                    ? 'Ønsker du å ' + (this.state.memberToProcess.active ? 'de' : '') + 'aktivere ' + this.state.memberToProcess.first_name + ' ' + this.state.memberToProcess.last_name + '?'
                                    : ''
                            }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleDialogClose} color="primary">
                            Avbryt
                        </Button>
                        <Button onClick={this.handleActivationClick} color="primary" autoFocus>
                            {this.state.memberToProcess.active ? 'Deaktiver' : 'Aktiver'}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.deleteDialogOpen}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Bekreft handling</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Ønsker du å slette {this.state.memberToProcess ? this.state.memberToProcess.first_name + ' ' + this.state.memberToProcess.last_name : ''}?
                            <br />
                            Denne handlingen kan ikke angres.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleDialogClose} color="primary">
                            Avbryt
                        </Button>
                        <Button onClick={this.handleDeleteClick} color="primary" autoFocus>
                            Slett bruker
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles)(UserDataTable);
