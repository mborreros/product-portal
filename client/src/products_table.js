import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import FilterComponent from './product_filter';

function ProductsTable({ products, setProducts, shelves }) {

  let defaultProductFormValues = {
    name: "",
    lot_number: "",
    weight: 0,
    complete: false,
    shelf_id: 0
  }

  const [productFormValues, setProductFormValues] = useState(defaultProductFormValues);
  const [productModalShow, setProductModalShow] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const handleModalClose = () => {
    setProductModalShow(false);
    setEditing(false);
    setProductFormValues(defaultProductFormValues);
  };
  const handleModalShow = () => setProductModalShow(true);

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
      text: "Action",
      className: "action",
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
      text: "Action",
      className: "action",
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

  const filteredProducts = products.filter(item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase()));

  // const FilterComponent = ({ filterText, onFilter, onClear }) => (
  //   <Row className='flex-nowrap'>
  //     <Form.Control className="filter-input" id="search" type="text" placeholder="Filter Products By Name" value={filterText} onChange={onFilter} />
  //     <Button type="button" onClick={onClear} size="sm" variant="light" className='clear-filter-button'>X</Button>
  //   </Row>
  // );

  const filterMemo = React.useMemo(() => {
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

    </Container>
  )
}

export default ProductsTable;