import React, {Component} from "react";
import {Button, Glyph} from "elemental";
import dlqClient from "./DlqClient";

class DlqRow extends Component {
    constructor(props) {
        super(props);
        this.dlq = props.dlq;
        this.state = {
            payloadModalIsOpen: false,
            headersModalIsOpen: false,
            redeliverDisabled: false,
            deleteDisabled: false
        };
        this.togglePayloadModal = this.togglePayloadModal.bind(this);
        this.toggleHeadersModal = this.toggleHeadersModal.bind(this);
        this.redeliver = this.redeliver.bind(this);
        this.delete = this.delete.bind(this);
    }

    togglePayloadModal() {
        this.props.setIndex(this.props.index);
        this.props.togglePayloadModal();
    }

    toggleHeadersModal() {
        this.props.setIndex(this.props.index);
        this.props.toggleHeadersModal();
    }

    redeliver() {
        this.setState({redeliverDisabled: true});
        dlqClient.redeliver(this.dlq.headers.id)
            .then(x => {
                this.setState({redeliverDisabled: false});
                this.props.fetch();
            });
    }

    delete() {
        this.setState({deleteDisabled: true});
        dlqClient.delete(this.dlq.headers.id)
            .then(x => {
                this.setState({deleteDisabled: false});
                this.props.fetch();
            });
    }

    render() {
        return (
            <tr>
                <td>
                    {this.dlq.headers["x-death"][0]["exchange"]}
                </td>
                <td>
                    {this.dlq.headers["x-death"][0]["queue"]}
                </td>
                <td>
                    {this.dlq.headers["x-death"][0]["count"]}
                </td>
                <td>
                    {new Date(this.dlq.headers["timestamp"]).toString()}
                </td>
                <td>
                    <Button onClick={this.togglePayloadModal}>Payload</Button>
                    <Button onClick={this.toggleHeadersModal}>Headers</Button>
                </td>
                <td>
                    <Button type="primary" onClick={this.redeliver} disabled={this.state.redeliverDisabled}><Glyph
                        icon="mail"/> Re-Deliver</Button>
                    <Button type="danger" onClick={this.delete} disabled={this.state.deleteDisabled}><Glyph
                        icon="trashcan"/> Remove</Button>
                </td>
            </tr>
        );
    }
}


export default DlqRow;