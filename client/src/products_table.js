import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useState, useRef, useMemo } from 'react';
import FilterComponent from './product_filter';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faBarcode, faArrowRightFromBracket, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment';

function ProductsTable({ products, setProducts, shelves }) {

  let defaultProductFormValues = {
    sap_material_number: "",
    name: "",
    lot_number: "",
    weight: 1,
    complete: false,
    shelf_id: 0
  }

  const barcodeRef = useRef();

  const [productFormValues, setProductFormValues] = useState(defaultProductFormValues);
  const [productModalShow, setProductModalShow] = useState(false);
  const [printModalShow, setPrintModalShow] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [barcode, setBarcode] = useState("");

  const filteredProducts = products.filter(item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase()));

  // modal functions
  const handleModalClose = () => {
    setEditing(false);
    setProductFormValues(defaultProductFormValues);
    setProductModalShow(false);
  };
  const handleModalShow = () => setProductModalShow(true);

  const handlePrintModalClose = () => {
    setPrintModalShow(false);
    setEditing(false);
  }

  // data table columns
  const columns = [
    {
      name: 'SAP Material No.',
      selector: row => row.sap_material_number,
      sortable: true,
      wrap: true,
      width: "135px",
      compact: true
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
      compact: true,
      width: "175px"
    },
    {
      name: 'Weight (kg)',
      selector: row => row.weight,
      sortable: true,
      center: true,
      width: "100px",
      compact: true
    },
    {
      name: 'Lot No.',
      selector: row => row.lot_number,
      sortable: true,
      center: true,
      width: "125px",
      compact: true
    },
    {
      name: 'Location',
      selector: row => row.shelf.name,
      sortable: true,
      center: true,
      compact: true
    },
    {
      text: "Edit",
      className: "edit",
      width: "135px",
      align: "left",
      sortable: false,
      compact: true,
      cell: (record) => {
        return (
          <Button
            className={record.complete ? "custom-disabled-button" : ""}
            variant="outline-primary"
            size="sm"
            disabled={record.complete}
            onClick={() => handleEditButton(record)}>
            <FontAwesomeIcon icon={faPenToSquare} /> &nbsp; Location
          </Button>
        );
      },
    },
    {
      text: "Print",
      className: "print",
      width: "80px",
      align: "left",
      sortable: false,
      compact: true,
      cell: (record) => {
        return (
          <Button
            className={record.complete ? "custom-disabled-button" : ""}
            variant="outline-success"
            size="sm"
            disabled={record.complete}
            onClick={() => handleBarcodePrint(record)}>
            <FontAwesomeIcon icon={faBarcode} /> &nbsp; Label
          </Button>
        );
      },
    },
    {
      name: 'Checked Out?',
      selector: row => row.complete ? "yes" : "no",
      sortable: true,
      width: "135px",
      center: true,
      compact: true
    },
    {
      text: "Check Out",
      className: "check-out",
      width: "135px",
      align: "left",
      sortable: false,
      compact: true,
      classNames: ["check-out-button"],
      cell: (record) => {
        return (
          <Button
            className={record.complete ? "custom-disabled-button" : ""}
            variant="outline-danger"
            size="sm"
            disabled={record.complete}
            onClick={() => handleCheckOutButton(record)}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} /> &nbsp; Check Out
          </Button>
        );
      },
    },
    {
      name: 'Last Updated',
      selector: row => row.updated_at,
      format: row => moment(row.updated_at).format("MM/DD/YYYY HH:mmA"),
      sortable: true,
      width: "100px",
      left: true,
      compact: true,
      wrap: true
    },
  ];

  // determining shelve dropdown options based on shelves in database
  let shelfOptions = shelves?.map(shelf => <option value={shelf.id} key={shelf.id}>{shelf.name}</option>)

  function handleProductInput(eventTarget) {
    setProductFormValues({ ...productFormValues, [eventTarget.name]: eventTarget.value })
  }

  function handleUpdateProduct(e) {
    e.preventDefault()

    fetch(`/api/products/${productFormValues.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productFormValues)
    })
      .then(response => response.json())
      .then(updatedProduct => {
        let updatedProductsArray = products.map((product) => product.id === updatedProduct.id ? updatedProduct : product)
        setProducts(updatedProductsArray)
      })
    setProductModalShow(false)
  }

  function handleProductSubmit(e) {
    e.preventDefault()

    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productFormValues)
    })
      .then(response => response.json())
      .then(newProduct => {
        setProducts([...products, newProduct])
        setProductModalShow(false)
      })
      .catch(error => console.log(error))

    setProductFormValues(defaultProductFormValues)
  }

  function handleEditButton(record) {
    setEditing(true)

    let editFormValues = {}
    for (const key in record) {
      if (Object.hasOwnProperty.call(record, key)) {
        if (key === 'shelf') {
          editFormValues['shelf_id'] = record.shelf.id
        } else {
          editFormValues[key] = record[key]
        }
      }
    }
    setProductFormValues(editFormValues)
    setProductModalShow(true)
  }

  function handleCheckOutButton(record) {

    fetch(`/api/products/${record.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complete: true })
    })
      .then(response => response.json())
      .then(checkedOutProduct => {
        let updatedProductsArray = products.map((product) => product.id === checkedOutProduct.id ? checkedOutProduct : product)
        setProducts(updatedProductsArray)
      })
  }

  function handleBarcodePrint(record) {
    setBarcode(record.name + ", " + record.lot_number + ", " + record.shelf.id);
    setPrintModalShow(true)
  }

  const handlePrint = useReactToPrint({
    content: () => barcodeRef.current,
    onAfterPrint: () => handlePrintModalClose()
  })

  // filter component for table header
  const filterMemo = useMemo(() => {
    const clearFilterText = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    };

    return (
      <FilterComponent onFilter={(e) => setFilterText(e.target.value)} onClear={clearFilterText} filterText={filterText} />
    );
  }, [filterText, resetPaginationToggle]);


  return (
    <Container>

      <Row className='mt-4'>
        <Col className='col-9'>
          <h3>Product Records</h3>
        </Col>
        <Col className='col-3 d-flex justify-content-end'>
          <Button className="check-in-button" variant="primary" size="sm" onClick={handleModalShow}>
            <FontAwesomeIcon icon={faArrowRightToBracket} /> &nbsp; Check In a Product
          </Button>
        </Col>
      </Row>

      <Row>
        <Col className='col-12 mt-4'>
          {products ? <DataTable
            columns={columns}
            data={filteredProducts}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={filterMemo}
            persistTableHead />
            : <></>}
        </Col>
      </Row>

      {/* check in & edit location of product modal */}
      <Modal show={productModalShow} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Check in a Product</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className='m-3'>
            <Form.Group className="mb-3">
              <Form.Label>SAP Material Number</Form.Label>
              <Form.Control type="name" name="sap_material_number" placeholder="Enter SAP material number" disabled={editing} value={productFormValues.sap_material_number} onChange={(e) => handleProductInput(e.target)} autoComplete="off" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="name" name="name" placeholder="Enter product name" disabled={editing} value={productFormValues.name} onChange={(e) => handleProductInput(e.target)} autoComplete="off" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lot Number</Form.Label>
              <Form.Control type="lot_number" name="lot_number" placeholder="Enter lot number" disabled={editing} value={productFormValues.lot_number} onChange={(e) => handleProductInput(e.target)} autoComplete="off" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control type="number" name="weight" placeholder="Enter weight in kilograms" disabled={editing} value={productFormValues.weight} onChange={(e) => handleProductInput(e.target)} min="1" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Storage Location</Form.Label>
              <Form.Select className="mb-3" name="shelf_id" value={productFormValues.shelf_id} onChange={(e) => handleProductInput(e.target)}>
                <option>Select a Shelf</option>
                {shelfOptions}
              </Form.Select>
            </Form.Group>

            <div className='d-flex justify-content-end'>
              {editing ?
                <Button variant="primary" type="button" onClick={(e) => handleUpdateProduct(e)}>Update</Button> :
                <Button variant="primary" type="button" onClick={(e) => handleProductSubmit(e)}>Submit</Button>
              }
            </div>

          </Form>
        </Modal.Body>

      </Modal>

      {/* barcode print modal */}
      <Modal show={printModalShow} onHide={handlePrintModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Print Label</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <Row className='barcode-wrap'>
              <div ref={barcodeRef} className="d-flex justify-content-center py-3">
                <Barcode value={barcode} lineColor='#00000' background='#FFFFFF' />
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

export default ProductsTable;