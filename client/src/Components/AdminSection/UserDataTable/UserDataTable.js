import { IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
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
});

class UserDataTable extends Component {

    constructor() {
        super();
        this.state = {
            studyProgrammes: [],
            members: []
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
                data.forEach(member => memberList.push(member));
                this.setState({ members: memberList }, function () {})
            })
            .catch(error => {
                console.log(error);
            });
    }

    async getData(endpoint) {
        const res = await fetch(endpoint);

        if (!res.ok) {
            throw new Error(res.status); // 404
        }

        const data = await res.json();
        return data;
    }

    handleEditClick = (id) => {
        console.log('Edit ' + id);
    }

    handleDeleteClick = (id) => {
        console.log('Delete ' + id);
    }

    formatTableRow(m) {
        const { classes } = this.props;
        const editButton = <IconButton className={classes.button} color="primary" onClick={this.handleEditClick.bind(this, m.user_id)}><Edit /></IconButton>;
        const deleteButton = <IconButton className={classes.button} color="secondary" onClick={this.handleDeleteClick.bind(this, m.user_id)}><Delete /></IconButton>;
        const actions = <div className={classes.buttonContainer}>{editButton}{deleteButton}</div>
        const active = m.active ? 'Ja' : 'Nei';
        const studyProgramme = this.state.studyProgrammes.find(sp => sp.study_programme_id === m.study_programme_id);
        const studyProgrammeName = studyProgramme != null ? studyProgramme.programme_code : '';
        const newsletter = m.newsletter ? 'Ja' : 'Nei';
        const vippsTransactionId = m.vipps_transaction_id == null ? '' : m.vipps_transaction_id;
        return [actions, active, m.user_id, m.first_name, m.last_name, m.student_email, m.private_email, m.year_of_admission, studyProgrammeName, newsletter, vippsTransactionId];
    }

    render() {
        const { classes } = this.props;

        const columns = [
            { name: 'Handlinger', options: { filter: false, display: true, sort: false } },
            { name: 'Aktiv', options: { filter: true, display: true } },
            { name: 'ID', options: { filter: false, display: false } },
            { name: 'Fornavn', options: { filter: false, display: true } },
            { name: 'Etternavn', options: { filter: false, display: true } },
            { name: 'Stud.epost', options: { filter: false, display: true } },
            { name: 'Priv.epost', options: { filter: false, display: true } },
            { name: 'Studiestart', options: { filter: true, display: true } },
            { name: 'Linje', options: { filter: true, display: true } },
            { name: 'Nyhetsbrev', options: { filter: true, display: true } },
            { name: 'Vipps', options: { filter: false, display: true } },
        ]

        const data = [];

        this.state.members.forEach(
            m => data.push(this.formatTableRow(m))
        );

        const options = {
            print: false,
            filterType: 'checkbox',
            selectableRows: false,
            textLabels: {
                body: {
                    noMatch: "Klarte ikke å finne noen elementer",
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

        return (
            <div className={classes.root}>
                <MUIDataTable
                    title={'Registreringer'}
                    data={data}
                    columns={columns}
                    options={options}
                />
            </div>
        );
    }
}

export default withStyles(styles)(UserDataTable);
