import { Container, Row, Col, Button, Form, Breadcrumb, InputGroup } from 'react-bootstrap';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import DataTable from 'react-data-table-component';
import moment from 'moment';

import ToolTip from './tooltip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faFileCircleCheck } from '@fortawesome/free-solid-svg-icons'


function AuditShelf({ shelves, products, setProducts, pageTitle }) {

  // states
  const [scannedShelf, setScannedShelf] = useState({});
  const [shelfSubmissionComplete, setShelfSubmissionComplete] = useState(false);
  const [scannedProducts, setScannedProducts] = useState([]);
  const [productUpdateComplete, setProductUpdateComplete] = useState(false);
  // DOM references
  const scannedShelfInput = useRef();
  const productInput = useRef();

  const navigate = useNavigate();

  // handle page title
  useEffect(() => {
    document.title = pageTitle || "";
  }, [pageTitle]);

  function handleShelfScan(e) {
    if (e.keyCode == 13) {  // capture enter key
      let shelfInfo = e.target.value.split(", ")
      let foundShelf = shelves.filter(shelf => shelf.id == parseInt(shelfInfo[0]))

      if (foundShelf.length && foundShelf[0].name == shelfInfo[1]) {
        setScannedShelf(foundShelf[0]);
        setShelfSubmissionComplete(true);
      } else {
        setScannedShelf({});
        setShelfSubmissionComplete(false);
        alert("This shelf was not found in database and needs to be added before it can be audited with this tool.")
        scannedShelfInput.current.value = "";
      }
    }
  }

  // handles clearing of the scanned shelf
  function handleShelfClear() {
    scannedShelfInput.current.value = "";
    setScannedShelf({});
    setShelfSubmissionComplete(false);
  }

  // focusing on the product input for easy scanning
  useEffect(() => {
    if (shelfSubmissionComplete && productInput.current) {
      productInput.current.focus();
    }
  }, [shelfSubmissionComplete, productInput]);

  // data table columns
  const columns = [
    {
      name: 'SAP Material No.',
      selector: row => row.sap_material_number,
      sortable: true,
      wrap: true,
      width: "175px",
      compact: true
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
      compact: true,
      width: "500px"
    },
    {
      name: 'Weight (kg)',
      selector: row => row.weight,
      sortable: true,
      center: true,
      width: "125px",
      compact: true
    },
    {
      name: 'Lot No.',
      selector: row => row.lot_number ? row.lot_number : "N/A",
      sortable: true,
      center: true,
      width: "150px",
      compact: true
    },
    {
      name: 'Checked Out?',
      selector: row => row.complete ? "yes" : "no",
      sortable: true,
      width: "175px",
      center: true,
      compact: true
    },
    {
      name: 'Last Updated',
      selector: row => row.updated_at,
      format: row => moment(row.updated_at).format("MM/DD/YYYY HH:mmA"),
      sortable: true,
      width: "200px",
      left: true,
      compact: true,
      wrap: true
    },
  ];

  // row styles to indicate whether in the right shelf or in the wrong shelf
  const conditionalRowStyles = [
    {
      when: row => row.shelf.id !== scannedShelf.id,
      style: row => ({
        borderLeft: "8px solid #c83131",
        borderRight: "8px solid #c83131",
      }),
    },
    {
      when: row => row.shelf.id == scannedShelf.id,
      style: row => ({
        borderLeft: "8px solid #5a8d03",
        borderRight: "8px solid #5a8d03"
      }),
    }]

  function handleProductScan(e) {
    // capture enter key
    if (e.keyCode == 13) {
      let foundProduct = products.filter(product => product.id == parseInt(e.target.value))
      if (foundProduct.length) {
        setScannedProducts([foundProduct[0], ...scannedProducts]);
        productInput.current.value = "";
      } else {
        alert("This product was not found in database and needs to be checked in.")
        productInput.current.value = "";
      }
    }
  }

  function handleShelfAudit() {
    let productsToUpdate = [];
    scannedProducts.filter(product => {
      if (product.shelf.id !== scannedShelf.id) {
        productsToUpdate.push({ id: product.id, shelf_id: scannedShelf.id })
      }
    })

    fetch('/api/products/shelf_audit', {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productsToUpdate)
    })
      .then(response => response.json())
      .then(updatedProducts => {
        let auditedProducts = products.map(product => updatedProducts.find(updatedProduct => updatedProduct.id === product.id) || product);
        setProducts(auditedProducts)
        setProductUpdateComplete(true)
        let updateAlertText
        if (updatedProducts.length > 1) {
          updateAlertText = updatedProducts.length + " products locations were updated and set to Shelf " + scannedShelf.name + "."
        } if (updatedProducts.length == 0 ) {
          updateAlertText = "No product locations were updated."
        }else (
          updateAlertText = updatedProducts.length + " product location was updated and set to Shelf " + scannedShelf.name + "."
        )
        alert(updateAlertText)
        navigate("/")
      })
      .catch(error => console.log(error))
  }

  return (
    <Container className='mt-4'>
      <Row>
        <Col className='col-12'>
          <h3>Audit Shelf Location</h3>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Products Records</Breadcrumb.Item>
            <Breadcrumb.Item active>Audit Shelf</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row className='mt-4 mb-5'>
        <Col className='col-5'>
          <InputGroup>
            <InputGroup.Text id="shelf-scan-text">Scan Shelf Barcode</InputGroup.Text>
            <Form.Control autoFocus ref={scannedShelfInput} id="shelf-details" aria-label="Shelf Location" autoComplete="off" onKeyUp={(e) => handleShelfScan(e)} disabled={shelfSubmissionComplete} readOnly={shelfSubmissionComplete} />
          </InputGroup>
        </Col>
        <Col className='col-5 d-flex justify-content-center align-items-center'>
          <p className="mb-0"> {scannedShelf.name ? `Shelf ${scannedShelf.name} has been selected for audit.` : "There is no shelf selected or found, scan a shelf to begin auditing."}</p>
        </Col>
        <Col className='col-2 d-flex justify-content-end align-items-center'>
          <Button id="clear-scanned-shelf-button" size="sm" variant='outline-danger' onClick={() => handleShelfClear()}>
            <FontAwesomeIcon icon={faXmark} /> &nbsp;Clear Shelf
          </Button>
        </Col>
      </Row>
      {shelfSubmissionComplete ?
        <>
          <hr className="mx-4" />
          <Row className='my-5'>
            <Col className='col-7'>
              <InputGroup>
                <InputGroup.Text id="product-scan-text">Scan Product Tag</InputGroup.Text>
                <Form.Control ref={productInput} id="product-details" aria-label="Scanned Product" autoComplete="off" disabled={productUpdateComplete} onKeyUp={(e) => handleProductScan(e)} />
              </InputGroup>
            </Col>
            <Col className='col-2 d-flex align-items-center'>
              <div className={scannedProducts.length == 0 ? "d-none" : ""}>
                <ToolTip placement="bottom" icon="info" message="If the product is marked green the system already has record of it at this shelf. If it is marked red, the system has record of it at a different shelf and will update it on submit. " />
              </div>
            </Col>
            <Col className='col-3 d-flex justify-content-end align-items-center'>
              <Button id="audit-products-submit-button" className={productUpdateComplete || scannedProducts.length == 0 ? "custom-disabled-button" : ""} variant="outline-success" size="sm" disabled={productUpdateComplete || scannedProducts.length == 0} onClick={() => handleShelfAudit()}>
                <FontAwesomeIcon icon={faFileCircleCheck} /> &nbsp;Submit Audited Products for Shelf
              </Button>
            </Col>
          </Row>
          <Row>
            <Col className='col-12'>
              <DataTable
                columns={columns}
                data={scannedProducts}
                conditionalRowStyles={conditionalRowStyles}
                pagination
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]} />
            </Col>
          </Row>
        </>
        : <></>
      }
    </Container>
  )
}

export default AuditShelf;