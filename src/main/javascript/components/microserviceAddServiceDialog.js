const React = require('react');
import {connect} from "react-redux";
import Dialog from "material-ui/Dialog";
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import Toggle from "material-ui/Toggle";
import {List, ListItem} from "material-ui/List";
import {Tabs, Tab} from 'material-ui/Tabs';

import LinkTextField from "./linkTextField";

const rest = require('rest');
const mime = require('rest/interceptor/mime');

const mapStateToProps = (state) => {
    return {
        menuMode: state.menuMode,
        entity: state.entity,
        topComitters: state.topComitters,
        addEditDialogFormAction: state.addEditDialogFormAction
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onCancel: function () {
            dispatch({
                type: 'CANCEL_MENU_ACTION',
            });
        },
        onSubmit: function () {
            let entity = {};

            for (var key in this.refs) {
                if (key.substr(0, 6) === "input_") {
                    if (this.refs[key] instanceof TextField) {
                        entity[key.substr(6)] = this.refs[key].getValue();
                    } else if (this.refs[key] instanceof Toggle) {
                        entity[key.substr(6)] = this.refs[key].isToggled();
                    } else {
                        console.log("unkown input type " + this.refs[key]);
                    }
                }
            }

            var request = {
                entity: entity,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (this.props.menuMode === this.props.editMenuMode) {
                request.path = this.props.addEditDialogFormAction;
                request.method = 'PUT';
            } else if (this.props.menuMode === this.props.addMenuMode) {
                request.path = this.props.addEditDialogFormAction;
                request.method = 'POST';
            }

            var client = rest.wrap(mime);
            client(request).then(response => {
                client({path: '/selavi/services'}).then(response => {
                    dispatch({
                        type: 'FETCH_MICROSERVICES_SUCCESS',
                        response: response
                    });
                });
            });
        }
    };
};

export class MicroserviceAddServiceDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {validationMessages: {}};
    }

    _handleOnSubmit() {
        if (this._validate()) {
            this.props.onSubmit.apply(this);
        }
    }

    _handleOnCancel() {
        this.setState({validationMessages: {}});
        this.props.onCancel();
    }

    _validate() {

        var validationMessages = {};
        var isValid = true;

        for (var key in this.props.textFields) {
            if (this.props.textFields[key].required) {
                if (!this.refs["input_" + key].getValue()) {
                    validationMessages[key] = "Field is required!";
                    isValid = false;
                }
            }
        }

        this.setState({validationMessages: validationMessages});
        return isValid;
    }

    _addTextField(options) {
        const rightcolumn = ((options.textFields.length - 1) % 3 === 0);

        let style;
        if (rightcolumn) {
            style = {marginLeft: "1em"};
        }

        if (options.isLink) {
            options.textFields.push(<LinkTextField key={"add_edit_dialog_" + options.key}
                                               style={style}
                                               ref={"input_" + options.key}
                                               floatingLabelText={options.label}
                                               hintText={options.hint}
                                               errorText={this.state.validationMessages[options.key]}
                                               defaultValue={options.value}
                                               disabled={options.disabled}></LinkTextField>);
        } else {
            options.textFields.push(<TextField key={"add_edit_dialog_" + options.key}
                                                   style={style}
                                                   ref={"input_" + options.key}
                                                   floatingLabelText={options.label}
                                                   hintText={options.hint}
                                                   errorText={this.state.validationMessages[options.key]}
                                                   defaultValue={options.value}
                                                   disabled={options.disabled}></TextField>);
        }

        if (rightcolumn) {
            options.textFields.push(<br key={"add_edit_dialog_br_" + options.textFields.length}/>);
        }
    }

    render() {

        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this._handleOnCancel.bind(this)}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                onTouchTap={this._handleOnSubmit.bind(this)}
            />
        ];

        var isOpen = false;
        var microservice = this.props.entity || {};
        var title = "";

        if (this.props.menuMode === this.props.addMenuMode) {
            isOpen = true;
            title = "Add " + this.props.entityDisplayName;
        } else if (this.props.menuMode === this.props.editMenuMode) {
            isOpen = true;
            title = "Edit " + this.props.entityDisplayName;
        } else {
            // dialog is closed, we can short-cut here
            return null;
        }

        let defaultPropertyInputs = [];

        let customProperties = Object.keys(microservice);

        for (var key in this.props.textFields) {
            let textField = this.props.textFields[key];

            let value = "";
            if (typeof(microservice[key]) === "string") {
                value = microservice[key];

                customProperties.splice(customProperties.indexOf(key), 1);
            }

            this._addTextField({
                textFields: defaultPropertyInputs,
                key: key,
                label: textField.label,
                hint: textField.hint,
                value: value,
                disabled: textField.disabled,
                isLink: textField.isLink
            });
        }

        for (var key in this.props.toggles) {
            let toggle = this.props.toggles[key];

            let value = false;
            if (typeof(microservice[key]) === "boolean") {
                value = microservice[key];

                customProperties.splice(customProperties.indexOf(key), 1);
            }

            defaultPropertyInputs.push(<Toggle key={"add_edit_dialog_" + key}
                                 ref={"input_" + key}
                                 label={toggle.label}
                                 defaultToggled={value}
                                 style={{marginTop: "2em", maxWidth: "23em"}}/>)
        }

        let customPropertyInputs = [];

        for (var idx in customProperties) {
            const key = customProperties[idx];

            if (typeof(microservice[key]) === "string") {
                this._addTextField({
                    textFields: customPropertyInputs,
                    key: key,
                    label: key,
                    hint: key,
                    value: microservice[key]
                });
            } else if (typeof(microservice[key]) === "boolean") {
                customPropertyInputs.push(<Toggle ref={"input_" + key}
                                     label={key}
                                     defaultToggled={microservice[key]}
                                     style={{marginTop: "2em", maxWidth: "23em"}}/>)
            } else {
                console.log("unkown property type for key \"" + key + "\" with value \"" + microservice[key] + "\"");
            }
        }

        let topComittersTab = undefined;

        if (Array.isArray(this.props.topComitters)) {
            let topComittersList = [];
            this.props.topComitters.forEach((propValue, index) => {
                topComittersList.push(<ListItem key={microservice.id + '_bitbucket_' + index}
                                           primaryText={propValue.emailAddress}
                                           secondaryText={propValue.numberOfCommits}/>);
            });

            topComittersTab = <Tab label="Bitbucket" >
                <List>
                    {topComittersList}
                </List>
            </Tab>
        }

        return (
            <Dialog
                title={title}
                actions={actions}
                modal={true}
                open={isOpen}
                repositionOnUpdate={false}>
                <Tabs>
                    <Tab label="Default Properties" >
                        {defaultPropertyInputs}
                    </Tab>
                    <Tab label="Custom Properties" >
                        {customPropertyInputs}
                    </Tab>
                    {topComittersTab}
                </Tabs>
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MicroserviceAddServiceDialog);
