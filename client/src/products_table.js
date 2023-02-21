import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useState, useEffect } from 'react';

function ProductsTable({ products, setProducts, shelves }) {

  let defaultProductFormValues = {
    name: "",
    lot_number: "",
    weight: 0,
    complete: false,
    shelf_id: 0
  }

  const [productFormValues, setProductFormValues] = useState(defaultProductFormValues);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleModalClose = () => {
    setShow(false);
    setEditing(false);
    setProductFormValues(defaultProductFormValues);
  };
  const handleModalShow = () => setShow(true);

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
      // cell: () => <Button variant="danger" size="sm" onClick={(row) => handleEditButton(row.id)}>edit location</Button>,
      // button: true
      // key: "action",
      text: "Action",
      className: "action",
      width: 100,
      align: "left",
      sortable: false,
      cell: (record) => {
        return (
          <Button
            className="btn btn-primary btn-sm"
            onClick={() => handleEditButton(record)}>
            Edit
          </Button>
        );
      },
    },
    {
      name: 'Checked Out?',
      selector: row => row.complete.toString(),
      sortable: true,
    }
  ];


  let shelfOptions = shelves?.map(shelf => <option value={shelf.id} key={shelf.id}>{shelf.name}</option>)

  function handleProductInput(eventTarget) {
    setProductFormValues({ ...productFormValues, [eventTarget.name]: eventTarget.value })
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
        setShow(false)
      })
      .catch(error => console.log(error))
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
    setShow(true)
  }

  function updateProduct(e) {
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
    setShow(false)
  }

  return (
    <Container>

      <Row className='mt-4'>
        <Col className='col-9'>
          <h3>Product Records</h3>
        </Col>
        <Col className='col-3 d-flex justify-content-end'>
          <Button variant="secondary" onClick={handleModalShow}>Check in a Product</Button>
        </Col>
      </Row>

      <Row>
        <Col className='col-12 mt-4'>
          {products ? <DataTable columns={columns} data={products} pagination /> : <></>}
        </Col>
      </Row>

      <Modal show={show} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Check in a Product</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className='m-3' onSubmit={(e) => editing ? updateProduct(e) : handleProductSubmit(e)}>
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
              <Button variant="primary" type="submit">Update</Button> :
              <Button variant="primary" type="submit">Submit</Button>
            }

          </Form>
        </Modal.Body>

      </Modal>

    </Container>
  )
}

export default ProductsTable;