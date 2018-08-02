import { IconButton, Tooltip, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Switch, FormControlLabel } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import Done from '@material-ui/icons/Done';
import Clear from '@material-ui/icons/Clear';
import MUIDataTable from 'mui-datatables';
import React, { Component } from 'react';

const styles = theme => ({
    root: {
        textAlign: "left"
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
                                const member = this.state.members.find(m => m.user_id === tableMeta.tableData[tableMeta.rowIndex].data[idIndex]);
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
                    return <Tooltip title={studyProgramme.name + '\n' + studyProgramme.length + ' år'}><Chip label={value} className={classes.chip} /></Tooltip>;
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
            studyProgrammes: [],
            members: [],
            activationDialogOpen: false,
            memberToActivate: {},
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
                this.setState({ members: memberList }, function () { });
            })
            .catch(error => {
                console.log(error);
            });
    }

    handleActivationDialogOpen = (member) => {
        this.setState({
            activationDialogOpen: true,
            memberToActivate: member
        });
    }

    handleActivationDialogClose = () => {
        this.setState({ activationDialogOpen: false });
    }

    handleActivationClick = () => {
        const member = this.state.memberToActivate;
        console.log(member);
        const activate = member.active ? 0 : 1;
        const payload = { userId: member.user_id, active: activate };
        console.log(payload);
        this.postData('http://localhost:8080/api/toggle_active', payload)
            .then(response => {
                console.log(response);
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

    handleEditClick = (member) => {
        console.log(member);
    }

    handleDeleteClick = (member) => {
        console.log(member);
    }

    formatTableRow(m) {
        const { classes } = this.props;

        const editButton = <Tooltip title="Rediger"><IconButton className={classes.button} color="primary" onClick={this.handleEditClick.bind(this, m)}><Edit /></IconButton></Tooltip>;
        const deleteButton = <Tooltip title="Slett"><IconButton className={classes.button} color="secondary" onClick={this.handleDeleteClick.bind(this, m)}><Delete /></IconButton></Tooltip>;
        const actions = <div className={classes.buttonContainer}>{editButton}{deleteButton}</div>

        const verifiedStudentEmail = m.verified_student_email ? 'Ja' : 'Nei';
        const studyProgramme = this.state.studyProgrammes.find(sp => sp.study_programme_id === m.study_programme_id);
        const studyProgrammeName = studyProgramme != null ? studyProgramme.programme_code : '';
        const newsletter = m.newsletter ? 'Ja' : 'Nei';
        const vippsTransactionId = m.vipps_transaction_id == null ? '' : m.vipps_transaction_id;

        return [actions, m.active, m.user_id, m.first_name, m.last_name, m.student_email, verifiedStudentEmail, m.private_email, m.year_of_admission, studyProgrammeName, newsletter, vippsTransactionId];
    }

    async getData(endpoint) {
        const res = await fetch(endpoint);

        if (!res.ok) {
            throw new Error(res.status); // 404
        }

        const data = await res.json();
        return data;
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

    render() {
        const { classes } = this.props;
        console.log(this.state);


        this.data = this.state.members.map(m => this.formatTableRow(m));

        return (
            <div className={classes.root}>
                <MUIDataTable
                    title={'Registreringer'}
                    data={this.data}
                    columns={this.columns}
                    options={this.options}
                />
                <Dialog
                    open={this.state.activationDialogOpen}
                    onClose={this.handleActivationDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Bekreft handling"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {
                                this.state.memberToActivate
                                    ? 'Ønsker du å ' + (this.state.memberToActivate.active ? 'de' : '') + 'aktivere ' + this.state.memberToActivate.first_name + ' ' + this.state.memberToActivate.last_name + '?'
                                    : ''
                            }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleActivationDialogClose} color="primary">
                            Avbryt
                        </Button>
                        <Button onClick={this.handleActivationClick} color="primary" autoFocus>
                            {this.state.memberToActivate.active ? 'Deaktiver' : 'Aktiver'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles)(UserDataTable);
