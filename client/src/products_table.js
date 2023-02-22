import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useState, useRef, useMemo } from 'react';
import FilterComponent from './product_filter';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';

function ProductsTable({ products, setProducts, shelves }) {

  let defaultProductFormValues = {
    name: "",
    lot_number: "",
    weight: 0,
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
    setProductModalShow(false);
    setEditing(false);
    setProductFormValues(defaultProductFormValues);
  };
  const handleModalShow = () => setProductModalShow(true);

  const handlePrintModalClose = () => setPrintModalShow(false)

  // data table columns
  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true
    },
    {
      name: 'Lot Number',
      selector: row => row.lot_number,
      sortable: true
    },
    {
      name: 'Weight (kg)',
      selector: row => row.weight,
      sortable: true
    },
    {
      name: 'Shelf Location',
      selector: row => row.shelf.name,
      sortable: true,
    },
    {
      text: "Edit",
      className: "edit",
      width: 100,
      align: "left",
      sortable: false,
      cell: (record) => {
        return (
          <Button
            className="btn btn-primary btn-sm"
            disabled={record.complete}
            onClick={() => handleEditButton(record)}>
            Edit
          </Button>
        );
      },
    },
    {
      name: 'Checked Out?',
      selector: row => row.complete ? "yes" : "no",
      sortable: true,
    },
    {
      text: "Check Out",
      className: "check-out",
      width: 100,
      align: "left",
      sortable: false,
      cell: (record) => {
        return (
          <Button
            className="btn btn-danger btn-sm"
            disabled={record.complete}
            onClick={() => handleCheckOutButton(record)}>
            Check Out
          </Button>
        );
      },
    },
    {
      text: "Print",
      className: "print",
      width: 100,
      align: "left",
      sortable: false,
      cell: (record) => {
        return (
          <Button
            className="btn btn-success btn-sm"
            disabled={record.complete}
            onClick={() => handleBarcodePrint(record)}>
            Label
          </Button>
        );
      },
    }
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

  // function handleBarcodeCreation(record) {
  //   console.log(record)
  // setBarcode(record.name + ", " + record.lot_number + ", " + record.shelf.id);
  //   // launchPrintModal(barcode)
  // }

  // const PrintBarcode = (record) => {
  //   console.log(barcodeRef)
  //   setBarcode(record.name + ", " + record.lot_number + ", " + record.shelf.id);
  //   //console.log('print');  
  //   let printContents = <Barcode value={barcode} lineColor='#00000' background='#FFFFFF' />;
  //   let originalContents = document.body.innerHTML;
  //   document.body.innerHTML = printContents;
  //   window.print();
  //   document.body.innerHTML = originalContents;
  // }

  // const handleBarcodePrint = (record) => useReactToPrint({
  //   content: () => <Barcode value={record.name + ", " + record.lot_number + ", " + record.shelf.id} lineColor='#00000' background='#FFFFFF' />
  // });

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
          <h4>Product Records</h4>
        </Col>
        <Col className='col-3 d-flex justify-content-end'>
          <Button className="check-in-button" variant="secondary" size="sm" onClick={handleModalShow}>Check in a Product</Button>
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

      <Modal show={productModalShow} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Check in a Product</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className='m-3'>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="name" name="name" placeholder="Enter product name" disabled={editing} value={productFormValues.name} onChange={(e) => handleProductInput(e.target)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lot Number</Form.Label>
              <Form.Control type="lot_number" name="lot_number" placeholder="Enter lot number" disabled={editing} value={productFormValues.lot_number} onChange={(e) => handleProductInput(e.target)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control type="number" name="weight" placeholder="Enter weight in kilograms" disabled={editing} value={productFormValues.weight} onChange={(e) => handleProductInput(e.target)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Storage Location</Form.Label>
              <Form.Select className="mb-3" name="shelf_id" value={productFormValues.shelf_id} onChange={(e) => handleProductInput(e.target)}>
                <option>Select a Shelf</option>
                {shelfOptions}
              </Form.Select>
            </Form.Group>

            {editing ?
              <Button variant="primary" type="button" onClick={(e) => handleUpdateProduct(e)}>Update</Button> :
              <Button variant="primary" type="button" onClick={(e) => handleProductSubmit(e)}>Submit</Button>
            }

          </Form>
        </Modal.Body>

      </Modal>

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