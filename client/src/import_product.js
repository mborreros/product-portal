import { Container, Row, Col, Button, Modal, Form, Dropdown } from 'react-bootstrap';
import { useState, useRef } from 'react';
import { read, utils } from 'xlsx';
import DataTable from 'react-data-table-component';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbTack } from '@fortawesome/free-solid-svg-icons'

function ImportProducts({ shelves, products, setProducts }) {

  const barcodesRef = useRef();

  const [pendingProducts, setPendingProducts] = useState([]);
  // const [barcodes, setBarcodes] = useState("");
  const [bulkPrintModalShow, setBulkPrintModalShow] = useState(false);

  let importedProductsBarcodes

  const handlePrintModalClose = () => {
    setBulkPrintModalShow(false);
  }

  const handlePrint = useReactToPrint({
    content: () => barcodesRef.current,
    onAfterPrint: () => handlePrintModalClose()
  })

  // import excel file
  const handleImport = ($event) => {
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;

        if (sheets.length) {
          const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
          let newRows = []
          // parse excel data to match database record table
          rows.forEach(row => {
            if (row['Material']) {
              let updatedRow = {
                sap_material_number: row['Material'].toString(),
                name: row['Material Description'],
                lot_number: row['Vendor Batch'],
                weight: row['Unrestricted'],
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
    let updatedRecords = pendingProducts.map((pendingProduct) => pendingProduct.sap_material_number === record.sap_material_number ? record : pendingProduct)
    setPendingProducts(updatedRecords)
  }

  function handleImportProductsSubmit() {

    let invalidPendingProductRecords = pendingProducts.filter((pendingProduct) => !pendingProduct.shelf_id)

    if (invalidPendingProductRecords.length !== 0) {
      alert(`${invalidPendingProductRecords.length === 1 ? invalidPendingProductRecords.length + " product" : invalidPendingProductRecords.length + " products"} do not have a location. Use the Set Location dropdown to select each products location, then resubmit.`)
    } else {
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingProducts)
      })
        .then(response => response.json())
        .then(importedProducts => {
          let allProducts = [...products, importedProducts]
          setProducts(allProducts.flat())

          importedProductsBarcodes = importedProducts.map((importedProduct) => {
            return (<Barcode value={importedProduct.name + ", " + importedProduct.lot_number + ", " + importedProduct.shelf.id} lineColor='#00000' background='#FFFFFF' />)
          })

        })
      setBulkPrintModalShow(true)
    }
  }

  // console.log(products)

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
      width: "150px",
    },
    {
      name: 'Lot No.',
      selector: row => row.lot_number,
      sortable: true,
      center: true,
      width: "150px",
    },
    {
      name: 'Location',
      selector: row => row.shelf_id,
      sortable: true,
      center: true,
      width: "200px",
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

            <Dropdown.Menu>
              {shelves.map((shelf) => <Dropdown.Item as="button" onClick={() => handleLocationInput(record, shelf.id)} key={shelf.id} id={record.id}>{shelf.name}</Dropdown.Item>)}
            </Dropdown.Menu>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Container className='mt-4'>
      <Row>
        <Col className='col-6'>
          <h3>Import an Excel File</h3>
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
        <Col className='col-12 d-flex justify-content-end'>
          {pendingProducts.length ?
            <Button size="sm" variant='primary' onClick={() => handleImportProductsSubmit()}>Submit Imported Products</Button> :
            <></>
          }
        </Col>
      </Row>

      {/* barcode print modal */}
      <Modal show={bulkPrintModalShow} onHide={handlePrintModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Print Label</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <Row className='barcode-wrap'>
              <div ref={barcodesRef} className="d-flex justify-content-center py-3">
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