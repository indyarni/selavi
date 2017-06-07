const React = require('react');

import { connect } from 'react-redux';
import { onAddProperty, onDeleteService, onDeleteLink, onEditLink } from './../actions/microserviceMindmapContextMenuActions';

const mapStateToProps = (state) => {
    return {
        top: state.contextMenuTop,
        left: state.contextMenuLeft,
        contextMenuServiceId: state.contextMenuServiceId,
        contextMenuFromId: state.contextMenuFromId,
        contextMenuToId: state.contextMenuToId,
        loggedInUser: state.loggedInUser
    };
};


const mapDispatchToProps = {
    onAddProperty,
    onDeleteService,
    onDeleteLink,
    onEditLink
};

export class MicroserviceMindmapContextMenu extends React.Component {

    render() {
        const { top, left } = this.props;
        const style = {position: 'fixed', top, left, zIndex: 999};

        if (this.props.loggedInUser) {
            if (this.props.contextMenuServiceId) {
                return (
                    <nav style={style} className="contextMenu">
                        <button onClick={this.props.onAddProperty}>Edit Service</button>
                        <button onClick={this.props.onDeleteService}>Delete Service</button>
                    </nav>
                );
            } else if (this.props.contextMenuFromId && this.props.contextMenuToId) {
                return (
                    <nav style={style} className="contextMenu">
                        <button onClick={this.props.onDeleteLink}>Delete Link</button>
                        <button onClick={this.props.onEditLink}>Edit Link</button>
                    </nav>
                );
            }
        } else if (this.props.contextMenuServiceId) {
            return (
                <nav style={style} className="contextMenu">
                    <button onClick={this.props.onAddProperty}>Show Service</button>
                </nav>
            );
        }

        return <nav hidden className="contextMenu"></nav>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (MicroserviceMindmapContextMenu);