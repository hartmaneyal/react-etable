import React, {useState, useEffect} from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import ToolkitProvider, {Search} from 'react-bootstrap-table2-toolkit'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlusSquare,faEdit,faTrash,faFileExcel,faUpload,faSave,faLock} from '@fortawesome/free-solid-svg-icons'
import {OverlayTrigger, Tooltip} from 'react-bootstrap'
import * as XLSX from 'xlsx'
import { ModalAlert } from './Modals/ModalAlert'
import { ModalLoader } from './Modals/ModalLoader'

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import './css/bootstrap.min.css'

export const eTable = (props) => {
    const [selectedRow, setSelectedRow] = useState(-1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selection, setSelection] = useState([]);

    const [showModalLoader, setShowModalLoader] = useState(false);
    const [loaderHeader, setLoaderHeader] = useState(null);
    const [loaderCloseText, setLoaderCloseText] = useState(null);
    const [loaderErrorText, setLoaderErrorText] = useState(null);
    const [loaderMismatchErrorText, setLoaderMismatchErrorText] = useState(null);
    const [loaderUploadText, setLoaderUploadText] = useState(null);
    const [fileFilter, setFileFilter] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);

    const [showModalAlert, setShowModalAlert] = useState(false);
    const [alertCloseText, setAlertCloseText] = useState(null);
    const [alertHeader, setAlertHeader] = useState(null);
    const [alertBody, setAlertBody] = useState(null);

    const [filterdData, setFilterdData] = useState(null);
    const [searchPattern, setSearchPattern] = useState('');
    const [callExternalSearch, setCallExternalSearch] = useState(false);
    const [searchPlaceholder, setSearchPlaceholder] = useState(null);
    const [searchDelay, setSearchDelay] = useState(null);

    const [selectionMode, setSelectionMode] = useState(null);

    const [addBtnToolTip, setAddBtnToolTip] = useState(null);
    const [editBtnToolTip, setEditBtnToolTip] = useState(null);
    const [deleteBtnToolTip, setDeleteBtnToolTip] = useState(null);
    const [downloadBtnToolTip, setDownloadBtnToolTip] = useState(null);
    const [uploadBtnToolTip, setUploadBtnToolTip] = useState(null);

    //====

    useEffect(() => {
        if(props.loaderHeader) setLoaderHeader(props.loaderHeader);
        else setLoaderHeader('Load file');
        if(props.loaderCloseText) setLoaderCloseText(props.loaderCloseText);
        else setLoaderCloseText('Cancel');
        if(props.loaderUploadText) setLoaderUploadText(props.loaderUploadText);
        else setLoaderUploadText('Upload');
        if(props.fileFilter) setFileFilter(props.fileFilter);
        else setFileFilter('.xlsx');
        if(props.loaderErrorText) setLoaderErrorText(props.loaderErrorText);
        else setLoaderErrorText('Failed to load file');
        if(props.loaderMismatchErrorText) setLoaderMismatchErrorText(props.loaderMismatchErrorText);
        else setLoaderMismatchErrorText('The file structure does not match the table structure');
        if(props.alertCloseText) setAlertCloseText(props.alertCloseText);
        else setAlertCloseText('OK');
        if(props.externalSearch) setExternalSearch(props.externalSearch);
        else setExternalSearch(false);
        if(props.searchDelay) setSearchDelay(props.searchDelay);
        else setSearchDelay(100);
        if(props.allowMultiSelect) setSelectionMode('checkbox');
        else setSelectionMode('radio');
        if(props.noSelection) setSelectionMode(props.noSelection ? 'none' : 'radio');

        if(props.addBtnToolTip) setAddBtnToolTip(props.addBtnToolTip);
        else setAddBtnToolTip('Add');
        if(props.editBtnToolTip) setEditBtnToolTip(props.editBtnToolTip);
        else setEditBtnToolTip('Edit');
        if(props.deleteBtnToolTip) setDeleteBtnToolTip(props.deleteBtnToolTip);
        else setDeleteBtnToolTip('Delete');
        if(props.downloadBtnToolTip) setDownloadBtnToolTip(props.downloadBtnToolTip);
        else setDownloadBtnToolTip('Download');
        if(props.uploadBtnToolTip) setUploadBtnToolTip(props.uploadBtnToolTip);
        else setUploadBtnToolTip('Upload');
    }, [])

    useEffect(() => {
        if(props.searchPlaceholder) setSearchPlaceholder(props.searchPlaceholder);
    }, [selectedRow])

    //====

    const isNullOrEmpty = (value) => {
        if(value == undefined || value == null || value.length == 0) return true;
        return false;
    }

    const isTrue = (value) => {
        if(value == undefined || value == null) return false;
        return (value == true);
    }

    const autofitColumns = (json, header) => {
        const jsonKeys = header ? header : Object.keys(json[0]);
        let objectMaxLength = [];
        for(let i = 0; i < json.length; i++){
            let value = json[i];
            for(let j = 0; j < jsonKeys.length; j++){
                if(typeof value[jsonKeys[j]] == 'number'){
                    objectMaxLength[j] = 10;
                } else {
                    const l = value[jsonKeys[j]] ? value[jsonKeys[j]].length : 0;
                    objectMaxLength[j] = objectMaxLength[j] >= l ? objectMaxLength[j] : l;
                }
            }
            let key = jsonKeys;
            for(let j = 0; j < key.length; j++){
                objectMaxLength[j] = objectMaxLength[j] >= key[j].length ? objectMaxLength[j] : key[j].length;
            }
        }
        return objectMaxLength.map(w => {return {width: w}});
    }

    const toJsonDataSource = (jsonDataOrig) => {
        let result = true;
        const columns = props.columns;
        jsonDataOrig.forEach((jsonRecord) => {
            let totalColsReverted = 0;
            const keys = Object.keys(jsonRecord);
            keys.forEach((key) => {
                let newKey = getColumnKey(columns, key);
                if(!isNullOrEmpty(newKey)){
                    jsonRecord[newKey] = jsonRecord[key];
                    totalColsReverted++;
                }
                delete jsonRecord[key];
            });
            if(totalColsReverted != columns.length){
                showAlert(loaderErrorText, loaderMismatchErrorText);
                result = false;
            }
        });
        return result;
    }

    const getColumnKey = (columns, title) => {
        try{
            let column = columns.filter(col => col.text == title);
            return column[0].dataField;
        } catch(err){
            console.error(err);
            return undefined;
        }
    }

    const handleSearch = (searchProps) => {
        try{
            if(isNullOrEmpty(searchProps)) return true;
            if(isNullOrEmpty(searchProps.searchText)) {
                setSearchPattern('');
                return true;
            }
            if(searchProps.externalSearch && searchProps.externalSearch == true) {
                setSearchPattern(searchProps.searchText);
                return true;
            }
            if(typeof searchProps.value != 'undefined'){
                return (searchProps.value+'').includes(searchProps.searchText);
            }
            return false;
        } catch(err){
            console.error(err);
            return false;
        }
    }

    const handleFilter = (newData) => {
        if(searchProps.externalSearch && searchProps.externalSearch == true) {
            setCallExternalSearch(true);
        }
        if(isNullOrEmpty(newData)) {
            setFilterdData(null);
            return;
        }
        if(newData.length == props.data.length){
            setFilterdData(null);
            return;
        } else {
            setFilterdData(newData);
            return;
        }
    }

    const handleSelect = (row, isSelect) => {
        const rowValue = row[props.keyColumn];
        if(!props.allowMultiSelect){
            setSelectedRow(rowValue);
            setSelection(row);
        } else {
            let selRows = selectedRows;
            let seltion = selection;
            if(selRows.includes(rowValue)){
                selRows = selRows.filter(function(value, index, arr){ return value != rowValue });
                seltion = seltion.filter(function(value, index, arr){ return value[props.keyColumn] != rowValue });
            } else {
                selRows.push(rowValue);
                seltion.push(row);
            }
            setSelectedRows(selRows);
            setSelection(seltion);
        }
    }

    const handleSelectAll = (isSelect) => {
        let newSelection = [];
        if(!isSelect){
            setSelectedRows([]);
            setSelection([]);
        } else {
            if(filterdData == null){
                setSelection(props.data);
            } else {
                newSelection = filterdData.map(row => row[props.keyColumn]);
                setSelection(filterdData);
            }
            setSelectedRows(newSelection);
        }
        return newSelection;
    }

    const handleDownload = () => {
        try{
            const columns = props.columns;
            let exData = props.data;
            exData.forEach((jsonRecord) => {
                const keys = Object.keys(jsonRecord);
                keys.forEach((key) => {
                    let recs = columns.filter(col => col.dataField == key);
                    if(recs.length == 0) delete jsonRecord[key];
                });
            });

            let worksheet = XLSX.utils.json_to_sheet(exData);
            let workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'data');

            const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

            for(let i = 0; i < columns.length; i++){
                worksheet[cols[i]+'1'].v = columns[i].text;
            }
            let colWidth = autofitColumns(exData, null);
            worksheet['!cols'] = colWidth;

            XLSX.writeFile(workbook, props.caller + '.xlsx');
        } catch(err){
            console.error(err);
        }
    }

    const handleUpload = () => {
        try{
            let reader = new FileReader();
            reader.readAsBinaryString(fileToUpload);
            reader.onload = (e) => {
                let data = e.target.result;
                let workbook = XLSX.read(data, {type: 'binary'});
                let firstSheet = workbook.SheetNames[0];
                let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], {defval: ''});
                if(toJsonDataSource(jsonData)){
                    setFileToUpload(null);
                    props.importMethod(props.caller, jsonData);
                }
            }
        } catch(err){
            console.log(err);
            showAlert(loaderErrorText, err);
        }
    }

    const fileUploadChange = (evt) => {
        setFileToUpload(evt.target.files[0]);
    }

    const showAlert = (header, body) => {
        setAlertHeader(header);
        setAlertBody(body);
        setShowModalAlert(true);
    }

    const alertClose = () => {
        setShowModalAlert(false);
    }

    const showUpload = () => {
        setShowModalLoader(true);
    }

    const closeUpload = () => {
        setShowModalLoader(false);
    }

    const displaySearchOverlay = () => {
        return (props.externalSearch && props.externalSearchMethod);
    }

    const doExternalSearch = () => {
        props.externalSearchMethod(searchPattern);
    }

    const mockFunction = () => {
        // do nothing
    }

    //====

    if(props.columns.length == 0){
        return (<React.Fragment></React.Fragment>);
    } else {
        const {SearchBar} = Search;
        const selectRow = {
            mode: selectionMode,
            clickToSelect: true,
            style: {'fontWeight':'bold', 'color': '#1f79a3'},
            onSelect: handleSelect,
            onSelectAll: handleSelectAll,
            hideSelectColumn: (selectionMode == 'none')
        }
        const rowEvents = {
            onDoubleClick: (e, row, rowIndex) => {
                if(props.doubleClickMethod){
                    props.doubleClickMethod(props.caller, row[props.keyColumn]);
                } else {
                    if(props.editMethod)
                        props.editMethod(props.caller, row[props.keyColumn])
                }
            }
        }
        const options = {sizePerPage: props.totalRecords, hideSizePerPage: (props.hideSizePerPage ? props.hideSizePerPage : true), showTotal: (props.showTotal ? props.showTotal : true) };
        return(
            <div>
                <div className='panel panel-default pannelBanner'>
                    <div className='pannel-heading pannel-heading-bigger'>{(props.tableHeader ? props.tableHeader : '')}</div>
                </div>
                <div className='panel panel-default pannelTable'>
                    <div className='controllsDiv'>
                        <span className={(isTrue(props.allowAdd) ? 'visibleItem' : 'hiddenItem' )}>
                            <OverlayTrigger placement='bottom' delay={{show: 100, hide: 100}} overlay={<Tooltip id='tlAdd'>{addBtnToolTip}</Tooltip>}>
                                <button id='addNewRecord' onClick={(props.addMethod ? props.addMethod.bind(this, props.caller) : mockFunction())} className='btn btn_icon_big controlBtn'>
                                    <FontAwesomeIcon icon={faPlusSquare} className='fa-xs' />
                                </button>
                            </OverlayTrigger>
                        </span>
                        <span className={(isTrue(props.allowEdit) ? 'visibleItem' : 'hiddenItem' )}>
                            <OverlayTrigger placement='bottom' delay={{show: 100, hide: 100}} overlay={<Tooltip id='tlEdit'>{editBtnToolTip}</Tooltip>}>
                                <button id='editRecord' onClick={(props.editMethod ? props.editMethod.bind(this, props.caller) : mockFunction())} className='btn btn_icon_big controlBtn'>
                                    <FontAwesomeIcon icon={faEdit} className='fa-xs' />
                                </button>
                            </OverlayTrigger>
                        </span>
                        <span className={(isTrue(props.allowDelete) ? 'visibleItem' : 'hiddenItem' )}>
                            <OverlayTrigger placement='bottom' delay={{show: 100, hide: 100}} overlay={<Tooltip id='tlDelete'>{deleteBtnToolTip}</Tooltip>}>
                                <button id='deleteRecord' onClick={(props.deleteMethod ? props.deleteMethod.bind(this, props.caller) : mockFunction())} className='btn btn_icon_big controlBtn'>
                                    <FontAwesomeIcon icon={faTrash} className='fa-xs' />
                                </button>
                            </OverlayTrigger>
                        </span>
                        <span className={(isTrue(props.allowDownload) ? 'visibleItem' : 'hiddenItem' )}>
                            <OverlayTrigger placement='bottom' delay={{show: 100, hide: 100}} overlay={<Tooltip id='tlDownload'>{downloadBtnToolTip}</Tooltip>}>
                                <button id='downloadRecord' onClick={(props.downloadMethod ? props.downloadMethod.bind(this, props.caller) : mockFunction())} className='btn btn_icon_big controlBtn'>
                                    <FontAwesomeIcon icon={faTrash} className='fa-xs' />
                                </button>
                            </OverlayTrigger>
                        </span>
                        <span className={(isTrue(props.allowUpload) ? 'visibleItem' : 'hiddenItem' )}>
                            <OverlayTrigger placement='bottom' delay={{show: 100, hide: 100}} overlay={<Tooltip id='tlUpload'>{uploadBtnToolTip}</Tooltip>}>
                                <button id='uploadRecord' onClick={(props.uploadMethod ? props.uploadMethod.bind(this, props.caller) : mockFunction())} className='btn btn_icon_big controlBtn'>
                                    <FontAwesomeIcon icon={faTrash} className='fa-xs' />
                                </button>
                            </OverlayTrigger>
                        </span>
                    </div>
                </div>
                <ToolkitProvider keyField={props.keyColumn} data={props.data} columns={props.columns} search={{onColumnMatch: (searchProps) => {return handleSearch(searchProps);},afterSearch:(newResult) => {handleFilter(newResult);}}} >
                    {props => (
                        <div>
                            <div className='searchDiv'>
                                <SearchBar {...props.searchProps} delay={searchDelay} placeholder={searchPlaceholder} className='searchFieldCustom' />
                            </div>
                            <div className={displaySearchOverlay() ? 'searchDivOverlay' : ''} onClick={doExternalSearch} />
                            <BootstrapTable id='mdbTable' {...props.baseProps} striped bordered hover defaultSorted={props.orderBy} pagination={paginationFactory(options)} SelectRow={selectRow} rowEvents={rowEvents} />
                        </div>
                    )}
                </ToolkitProvider>
                <ModalLoader show={showModalLoader} close={closeUpload} fileUpload={fileUploadChange} upload={handleUpload} header={loaderHeader} accept={fileFilter} cancelText={loaderCloseText} uploadText={loaderUploadText} />
                <ModalAlert show={showModalAlert} close={alertClose} header={alertHeader} body={alertBody} closeText={alertCloseText} />
            </div>
        );
    }
}