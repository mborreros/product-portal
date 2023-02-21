import { Table, Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';

function ProductsTable({ products, setProducts, shelves }) {

  // console.log(shelves)

  let defaultProductFormValues = {
    name: "",
    lot_number: "",
    weight: 0,
    complete: false,
    shelf_id: 0
  }

  const [productFormValues, setProductFormValues] = useState(defaultProductFormValues)
  const [show, setShow] = useState(false)

  const handleModalClose = () => setShow(false);
  const handleModalShow = () => setShow(true);

  // let tableHeaders = []
  // if (products) {
  //   const allProductRecordColumns = Object.keys(products[0])
  //   tableHeaders = allProductRecordColumns.filter(column => column !== "id")
  // }

  let shelfOptions = shelves?.map(shelf => <option value={shelf.id} key={shelf.id}>{shelf.name}</option>)

  function handleProductInput(eventTarget) {
    setProductFormValues({...productFormValues, [eventTarget.name]: eventTarget.value})
  }

  function handleProductSubmit(e){
    e.preventDefault()

    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productFormValues)
    })
    .then(response => response.json())
    .then(newProduct => setProducts(...products, newProduct))
    .catch(error => console.log(error))
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
          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>Lot Number</th>
                <th>Name</th>
                <th>Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
              </tr>
              <tr>
                <td>3</td>
                <td colSpan={2}>Larry the Bird</td>
                <td>@twitter</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      <Modal show={show} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Check in a Product</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className='m-3' onSubmit={(e) => handleProductSubmit(e)}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="name" name="name" placeholder="Enter product name" onChange={(e) => handleProductInput(e.target)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lot Number</Form.Label>
              <Form.Control type="lot_number" name="lot_number" placeholder="Enter lot number" onChange={(e) => handleProductInput(e.target)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control type="number" name="weight" placeholder="Enter weight in kilograms" onChange={(e) => handleProductInput(e.target)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Storage Location</Form.Label>
              <Form.Select className="mb-3" name="shelf_id" onChange={(e) => handleProductInput(e.target)}>
                <option>Select a Shelf</option>
                {shelfOptions}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">Submit</Button>

          </Form>
        </Modal.Body>

      </Modal>

    </Container>
  )
}

export default ProductsTable;