import React, {useState, useEffect} from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

export function ModalLoader (props){
    return(
        <Modal style={{opacity:1, marginTop:'15%'}} show={props.show} onHide={props.close}>
            <Modal.Header>
                <Modal.Title style={{color: 'black'}}>{props.header}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Control type='file' accept={props.fileTypes} onChange={props.fileUpload}></Form.Control>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={props.close}>{props.cancelText}</Button>
                <Button variant='primary' onClick={props.upload}>{props.uploadText}</Button>
            </Modal.Footer>
        </Modal>
    );
}