const React = require('react');
const rest = require('rest');
const mime = require('rest/interceptor/mime');
import {connect} from "react-redux";
import MicroserviceMindmapContextMenu from "./microserviceMindmapContextMenu";

const mapStateToProps = (state) => {
    return {
        microservices: state.microservices,
        addLinkConsumerId: state.addLinkConsumerId
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onSelectMicroserviceNode: function (params) {
            if (this.props.addLinkConsumerId) {
                var client = rest.wrap(mime);
                client({
                    path: '/services/' + this.props.addLinkConsumerId + '/relation',
                    method: 'PUT',
                    entity: params.nodes[0]
                }).then(response => {
                    dispatch({
                        type: 'ADD_LINK_SET_CONSUMED_SERVICE',
                        consumedServiceId: params.nodes[0]
                    });
                });

            } else {
                dispatch({
                    type: 'MICROSERVICE_NODE_SELECTED',
                    selectedServiceId: params.nodes[0]
                });
            }
        },
        onContextMenuOpen: function (params) {
            params.event.preventDefault();

            const nodeId = this.getNodeAt(params.pointer.DOM);

            if (nodeId) {
                // right click does not select node!
                this.selectNodes([nodeId]);

                dispatch({
                    type: 'CONTEXT_MENU_OPEN',
                    top: params.pointer.DOM.y,
                    left: params.pointer.DOM.x,
                    contextMenuServiceId: nodeId
                });
            } else {
                this.unselectAll();

                dispatch({
                    type: 'CONTEXT_MENU_OPEN',
                    top: -1,
                    left: -1,
                    contextMenuServiceId: undefined
                });
            }
        }
    };
};

export class MicroserviceMindmap extends React.Component {

    componentDidMount() {
        this.updateMindmap();
    }

    componentDidUpdate() {
        this.updateMindmap();
    }

    updateMindmap() {
        var microservices = this.props.microservices.map(microservice => {
            if (microservice.isExternal) {
                microservice.color = "orange";
            } else {
                microservice.color = "lightblue";
            }
            return microservice;
        });

        // create an array with nodes
        var nodes = new vis.DataSet(microservices);

        var edgeArray = [];

        microservices.filter(function (el) {
            return el.consumes;
        }).forEach(function (el) {
            el.consumes.forEach(function (consumer) {
                edgeArray.push({
                    from: el.id,
                    to: consumer
                });
            });
        });

        var edges = new vis.DataSet(edgeArray);

        // create a network
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            nodes: {
                borderWidth: 2,
                shadow: true,
                font: {color: "white"}
            },
            edges: {
                width: 2,
                shadow: true
            },
            layout: {
                randomSeed: 2
            }
        };

        var network = new vis.Network(this.refs.vizcontainer, data, options);

        var boundFn = this.props.onSelectMicroserviceNode.bind(this);

        network.on("selectNode", boundFn);
        network.on("oncontext", this.props.onContextMenuOpen);
    }

    render() {
        return (
            <div className="microserviceMindmap">
                <MicroserviceMindmapContextMenu/>
                <div ref="vizcontainer"></div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MicroserviceMindmap);