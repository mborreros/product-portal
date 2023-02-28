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
import { faThumbTack, faBoxesStacked } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment';

function ImportProducts({ shelves, products, setProducts }) {

  const barcodesRef = useRef();
  const navigate = useNavigate();

  const [pendingProducts, setPendingProducts] = useState([]);
  const [importedProducts, setImportedProducts] = useState([]);
  const [importComplete, setImportComplete] = useState(false);
  const [bulkPrintModalShow, setBulkPrintModalShow] = useState(false);
  const [splitProductModalShow, setSplitProductModalShow] = useState(false);
  const [productToSplit, setProductToSplit] = useState({});
  const [splitBy, setSplitBy] = useState("");
  const [validated, setValidated] = useState(false)

  const handlePrintModalClose = () => {
    setImportedProducts([])
    setBulkPrintModalShow(false);
  }

  const handleSplitProductModalClose = () => {
    setProductToSplit({})
    setSplitBy("")
    setValidated(false)
    setSplitProductModalShow(false)
  };

  const handlePrint = useReactToPrint({
    content: () => barcodesRef.current,
    onAfterPrint: () => handlePrintModalClose()
  })

  function resetAllStateDefaults() {
    setPendingProducts([]);
    setImportedProducts([]);
    setImportComplete(false)
  }

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
            if (row['Material'] && row['Unrestricted']) {
              let updatedRow = {
                uuid: uuid(),
                sap_material_number: row['Material'].toString(),
                name: row['Material Description'],
                lot_number: row['Vendor Batch'],
                weight: row['Unrestricted'],
                allow_split: true,
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

  function handleProductSplit(record) {
    setProductToSplit(record)
    setSplitProductModalShow(true)
  }

  function splitProduct(e) {

    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
    } else {
      e.preventDefault()
      // find index of product to remove
      const indexToRemove = pendingProducts.map(product => product.uuid).indexOf(productToSplit.uuid)

      // construct array of objects to insert
      // replicated record with quantity divides by splitBy
      const splitProduct = productToSplit
      splitProduct.weight = (productToSplit.weight / splitBy)

      let newProductsFromSplit = []

      for (let i = 0; i < splitBy; i++) {
        newProductsFromSplit.push({ ...productToSplit, uuid: uuid(), allow_split: false })
      }

      let allProducts = [...pendingProducts]
      allProducts.splice(indexToRemove, 1, ...newProductsFromSplit)

      setPendingProducts(allProducts)

      // reset states prior to close
      setProductToSplit({})
      setSplitBy("")
      setValidated(false)
      setSplitProductModalShow(false)
    }
  }

  const importedProductsBarcodes = importedProducts.map((importedProduct) => {
    return (
      <div className='p-4 d-flex justify-content-center' key={importedProduct.uuid}>
        <Barcode value={importedProduct.name + ", " + importedProduct.lot_number + ", " + importedProduct.shelf_id} lineColor='#00000' background='#FFFFFF' width={1} textAlign="center" />
      </div>)
  })

  const columns = [
    {
      name: 'SAP Material No.',
      selector: row => row.sap_material_number,
      sortable: true,
      wrap: true,
      width: "175px",
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
      width: "325px"
    },
    {
      name: 'Weight (kg)',
      selector: row => row.weight,
      sortable: true,
      center: true,
      width: "115px",
    },
    {
      text: "Split Product",
      className: "split-product",
      width: "110px",
      align: "left",
      sortable: false,
      cell: (record) => {
        return (
          <Button
            className={record.allow_split ? "" : "custom-disabled-button"}
            variant="outline-primary"
            size="sm"
            disabled={!record.allow_split}
            onClick={() => handleProductSplit(record)}>
            <FontAwesomeIcon icon={faBoxesStacked} /> &nbsp; Split
          </Button>
        );
      },
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
              <Dropdown.Item as="button" onClick={() => handleLocationInput(record)}>&nbsp;</Dropdown.Item>
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

      {/* split products modal */}
      <Modal show={splitProductModalShow} onHide={handleSplitProductModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Split a Product</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className='m-3' noValidate validated={validated} onSubmit={(e) => splitProduct(e)}>
            <Row>
              <p className='input-modal-text text-muted mb-1'>Input the value you are splitting this product by. </p>
              <p className='input-modal-text text-muted'>Note: Products can only be split once; ensure you are splitting by the correct number. </p>
            </Row>
            <Row>
              <Col className='col-6 d-flex align-items-center pt-2'>
                <Form.Label>Quantity to Split Into</Form.Label>
              </Col>
              <Col className='col-6'>
                <Form.Control required type="number" placeholder="Enter a value" min="2" step="1" value={splitBy} onChange={e => setSplitBy(e.target.value)} autoComplete="off" />
              </Col>
            </Row>

            <div className='d-flex justify-content-end mt-4'>
              <Button variant="primary" type="submit">Split Product</Button>
            </div>

          </Form>
        </Modal.Body>

      </Modal>

    </Container>
  )
}

export default ImportProducts;