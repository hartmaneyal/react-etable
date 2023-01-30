import React, {useState, useEffect} from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

const ref = React.createRef();
export function ModalAlert (props){
    useEffect(() => {
        if(props.show) ref.current?.focus();
    }, [props.show])
    return(
        <Modal style={{opacity:1, marginTop:'15%'}} show={props.show} onHide={props.close}>
            <Modal.Header>
                <Modal.Title style={{color: 'black'}}>{props.header}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Label>{props.body}</Form.Label>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='primary' onClick={props.close}>{props.closeText}</Button>
            </Modal.Footer>
        </Modal>
    );
}