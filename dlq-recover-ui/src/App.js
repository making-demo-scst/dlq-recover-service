import React, {Component} from "react";
import {Button, Alert, Table, Modal, ModalHeader, ModalBody, ModalFooter, Glyph} from "elemental";
import DlqRow from "./DlqRow";
import dlqClient from "./DlqClient";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            payloadModalIsOpen: false,
            headersModalIsOpen: false,
            serviceAvailable: true,
            dlqs: [],
            index: 0
        };
        this.togglePayloadModal = this.togglePayloadModal.bind(this);
        this.toggleHeadersModal = this.toggleHeadersModal.bind(this);
        this.setIndex = this.setIndex.bind(this);
        this.fetch = this.fetch.bind(this);
    }

    togglePayloadModal() {
        this.setState({
            payloadModalIsOpen: !this.state.payloadModalIsOpen,
            headersModalIsOpen: false
        });
    }

    toggleHeadersModal(index) {
        this.setState({
            payloadModalIsOpen: false,
            headersModalIsOpen: !this.state.headersModalIsOpen
        });
    }

    setIndex(index) {
        this.setState({
            index: index
        });
    }

    componentDidMount() {
        this.fetch();
        setInterval(this.fetch, 5000);
    }

    fetch() {
        dlqClient.fetch().then(x => {
            this.setState({
                dlqs: x,
                serviceAvailable: true
            });
        }).catch(error => {
            console.log(error);
            this.setState({
                serviceAvailable: false
            });
        });
    }

    render() {
        let rows = this.state.dlqs.map((x, i) => (
            <DlqRow key={x.headers.id} dlq={x} index={i}
                    setIndex={this.setIndex}
                    fetch={this.fetch}
                    togglePayloadModal={this.togglePayloadModal}
                    toggleHeadersModal={this.toggleHeadersModal}/>));
        let modals = (rows.length > 0) ? (
            <div>
                <Modal isOpen={this.state.payloadModalIsOpen} onCancel={this.togglePayloadModal} backdropClosesModal>
                    <ModalHeader text="Payload" showCloseButton
                                 onClose={this.togglePayloadModal}/>
                    <ModalBody>
                        <pre><code>{JSON.stringify(JSON.parse(this.state.dlqs[this.state.index].payload), null, 2)}</code></pre>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="primary" onClick={this.togglePayloadModal}>Close</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.headersModalIsOpen} onCancel={this.toggleHeadersModal} backdropClosesModal>
                    <ModalHeader text="Headers" showCloseButton
                                 onClose={this.toggleHeadersModal}/>
                    <ModalBody>
                        <pre><code>{JSON.stringify(this.state.dlqs[this.state.index].headers, null, 2)}</code></pre>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="primary" onClick={this.toggleHeadersModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>) : (<div></div>);
        return (
            <div className="wrapper">
                <h2>😇 DLQ Recovery Center 🚑</h2>
                {this.state.serviceAvailable ? ((this.state.dlqs.length > 0) ? (
                    <Alert type="warning"><strong>Warning:</strong> You have DLQ(s)!!</Alert>) : (
                    <Alert type="success">No DLQ remains.</Alert>)) : (
                    <Alert type="danger"><strong>Error:</strong> Service is unavilable!!</Alert>)}
                <br/>
                <Button onClick={this.fetch}><Glyph icon="sync"/> Reload</Button>
                <Table>
                    <colgroup>
                        <col width="150"/>
                        <col width="200"/>
                        <col width=""/>
                        <col width=""/>
                        <col width=""/>
                        <col width=""/>
                        <col width="200"/>
                        <col width="250"/>
                    </colgroup>
                    <thead>
                    <tr>
                        <th>Exchange</th>
                        <th>Queue</th>
                        <th>Reject Count</th>
                        <th>Date</th>
                        <th>View JSON</th>
                        <th>Operations</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </Table>
                {modals}
            </div>
        );
    }
}

export default App;