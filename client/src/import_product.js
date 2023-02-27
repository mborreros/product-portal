import { Container, Row, Col, Button, Modal, Form, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useState, useRef } from 'react';
import { read, utils } from 'xlsx';
import DataTable from 'react-data-table-component';
import Barcode from 'react-barcode';
import _ from "lodash";
import uuid from 'react-uuid';
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbTack } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment';

function ImportProducts({ shelves, products, setProducts }) {

  const barcodesRef = useRef();
  const navigate = useNavigate();

  const [pendingProducts, setPendingProducts] = useState([]);
  const [importedProducts, setImportedProducts] = useState([]);
  const [importComplete, setImportComplete] = useState(false);
  const [bulkPrintModalShow, setBulkPrintModalShow] = useState(false);

  const handlePrintModalClose = () => {
    setImportedProducts([])
    setBulkPrintModalShow(false);
  }

  const handlePrint = useReactToPrint({
    content: () => barcodesRef.current,
    onAfterPrint: () => handlePrintModalClose()
  })

  function resetAllStateDefaults() {
    setPendingProducts([]);
    setImportedProducts([]);
    setImportComplete(false)
  }

  // rounding date to nearest day based on excel imported date
  // function formatRoundDate(date) {
  //   if (date.getHours() >= 13) {
  //     let result = new Date(date);
  //     let roundedDate = date.getDate() + 1
  //     result = result.setDate(roundedDate);
  //     return moment(result).format("MM/DD/YYYY")
  //   } else {
  //     return moment(date).format("MM/DD/YYYY")
  //   }
  // }

  // import excel file
  const handleImport = ($event) => {
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      resetAllStateDefaults();
      reader.onload = (event) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;

        if (sheets.length) {
          const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
          let newRows = []

          rows.forEach(row => {
            console.log(row)
            if (row['Material'] && row['Unrestricted']) {
              let updatedRow = {
                uuid: uuid(),
                sap_material_number: row['Material'].toString(),
                name: row['Material Description'],
                lot_number: row['Vendor Batch'],
                weight: row['Unrestricted'],
                // formatting date into javascript date from excel date
                expiration_date: new Date(Date.UTC(0, 0, row['SLED/BBD'])),
                shelf_id: ""
              }
              newRows.push(updatedRow)
            }
          })
          setPendingProducts(newRows)
        }
      }
      reader.readAsArrayBuffer(file);
    }
  }

  function handleLocationInput(record, shelfId) {
    record.shelf_id = shelfId
    let updatedRecords = pendingProducts.map((pendingProduct) => pendingProduct.uuid === record.uuid ? record : pendingProduct)
    setPendingProducts(updatedRecords)
  }

  function handleImportProductsSubmit() {
    setImportedProducts(pendingProducts)
    setBulkPrintModalShow(true)
  }

  const importedProductsBarcodes = importedProducts.map((importedProduct) => {
    return (
      <div className='p-4 d-flex justify-content-center' key={importedProduct.lot_number}>
        <Barcode value={importedProduct.name + ", " + importedProduct.lot_number + ", " + importedProduct.shelf_id} lineColor='#00000' background='#FFFFFF' width={1} textAlign="center" />
      </div>)
  })

  const columns = [
    {
      name: 'SAP Material No.',
      selector: row => row.sap_material_number,
      sortable: true,
      wrap: true,
      width: "200px",
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
      width: "400px"
    },
    {
      name: 'Weight (kg)',
      selector: row => row.weight,
      sortable: true,
      center: true,
      width: "115px",
    },
    {
      name: 'Lot No.',
      selector: row => row.lot_number,
      sortable: true,
      center: true,
      width: "150px",
    },
    {
      name: 'Expiration',
      selector: row => row.expiration_date,
      format: row => moment(row.expiration_date).format("MM/DD/YYYY"),
      sortable: true,
      center: true,
      width: "150px",
    },
    {
      name: 'Location',
      selector: row => row.shelf_id,
      sortable: true,
      center: true,
      width: "100px",
    },
    {
      text: "Set Location",
      className: "set-location",
      width: "150px",
      right: true,
      sortable: false,
      compact: true,
      cell: (record) => {
        return (
          <Dropdown>
            <Dropdown.Toggle variant="outline-success" size="sm" id="location-dropdown">
              <FontAwesomeIcon icon={faThumbTack} /> &nbsp; Set Location
            </Dropdown.Toggle>

            <Dropdown.Menu popperConfig={{ strategy: "fixed" }} renderOnMount={true}>
              {shelves.map((shelf) => <Dropdown.Item as="button" onClick={() => handleLocationInput(record, shelf.id)} key={shelf.id} id={record.id}>{shelf.name}</Dropdown.Item>)}
            </Dropdown.Menu>
          </Dropdown>
        );
      },
    },
  ];

  function handleBulkPost() {
    let invalidPendingProductRecords = pendingProducts.filter((pendingProduct) => !pendingProduct.shelf_id)

    if (invalidPendingProductRecords.length !== 0) {
      let message = invalidPendingProductRecords.length === 1 ? invalidPendingProductRecords.length + " product does" : invalidPendingProductRecords.length + " products do"
      alert(`${message} not have a location. Use the Set Location dropdown to select each products location, then resubmit.`)
    } else {
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingProducts)
      })
        .then(response => response.json())
        .then(newProducts => {
          let allProducts = [...products, newProducts]
          setProducts(allProducts.flat())
        })
      setImportComplete(true)
    }
  }

  return (
    <Container className='mt-4'>
      <Row>
        <Col className='col-6'>
          <h3>Import Products from an Excel File</h3>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Products Records</Breadcrumb.Item>
            <Breadcrumb.Item active>Import Products</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col className='col-6'>
          <Form.Control type="file" name="file" className="custom-file-input" id="inputGroupFile" required onChange={handleImport}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
        </Col>
      </Row>

      <Row>
        <Col className='col-12 mt-4'>
          {pendingProducts ? <DataTable
            columns={columns}
            data={pendingProducts} />
            : <></>}
        </Col>
      </Row>

      <Row className='m-4'>
        {pendingProducts.length ?
          <>
            <Col className='col-10 d-flex justify-content-end pe-0'>
              <Button size="sm" variant='primary' disabled={!importComplete} className={!importComplete ? "custom-disabled-button" : ""} onClick={() => handleImportProductsSubmit()}>Print Imported Product Labels</Button>
            </Col>
            <Col className='col-2 d-flex justify-content-end ps-0'>
              <Button size="sm" variant='primary' disabled={importComplete} className={importComplete ? "custom-disabled-button" : ""} onClick={() => handleBulkPost()}>Publish Imported Records</Button>
            </Col>
          </> :
          <></>
        }

      </Row>

      {/* barcode print modal */}
      <Modal show={bulkPrintModalShow} onHide={handlePrintModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Print Label</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <Row className='barcode-wrap'>
              <div ref={barcodesRef} className="page-break">
                {importedProductsBarcodes}
              </div>
            </Row>
            <Row>
              <Col className='d-flex justify-content-center pt-4'>
                <Button onClick={handlePrint}>Print</Button>
              </Col>
            </Row>
          </Container>
        </Modal.Body>

      </Modal>

    </Container>
  )
}

export default ImportProducts;