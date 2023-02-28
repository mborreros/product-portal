import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useState, useRef, useMemo } from 'react';
import FilterComponent from './product_filter';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faBarcode, faArrowRightFromBracket, faArrowRightToBracket, faFileImport, faDolly } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import unilever_logo from "./imgs/unilever-logo.png"

function ProductsTable({ products, setProducts, shelves }) {

  let defaultProductFormValues = {
    sap_material_number: "",
    name: "",
    lot_number: "",
    weight: 1,
    expiration_date: "",
    complete: false,
    shelf_id: 0
  }

  let defaultUnileverFormValues = {
    product_name: "",
    product_lot_number: "",
    description: "",
    unilever_item_number: "",
    unilever_address: {
      recipient: "",
      street_address: "",
      city: "",
      state: "",
      country: "USA"
    },
    expiration_date: "",
    net_weight: 0,
    po_box_number: 0
  }

  let unileverPartNumbers = [
    {
      unilever_product_number: "",
      unilever_product_description: ""
    },
    {
      unilever_product_number: "67668451",
      unilever_product_description: "GLB Acai Extract GL"
    },
    {
      unilever_product_number: "67673046",
      unilever_product_description: "GLB Fig Extract GL"
    },
    {
      unilever_product_number: "67664007",
      unilever_product_description: "GLB Goji Berry Extract GL"
    },
    {
      unilever_product_number: "67670013",
      unilever_product_description: "GLB Green Tea Extract GL"
    },
    {
      unilever_product_number: "67664017",
      unilever_product_description: "GLB Guava Extract GL"
    },
    {
      unilever_product_number: "67670063",
      unilever_product_description: "GLB Hibiscus Extract GL"
    },
    {
      unilever_product_number: "67673695",
      unilever_product_description: "GLB Irish Moss Extract GL"
    },
    {
      unilever_product_number: "67669875",
      unilever_product_description: "GLB Marshmallow Extract GL"
    },
    {
      unilever_product_number: "67670067",
      unilever_product_description: "GLB Nettle Extract GL"
    },
    {
      unilever_product_number: "67670107",
      unilever_product_description: "GLB Oat Extract GL"
    },
    {
      unilever_product_number: "67669925",
      unilever_product_description: "GLB Peppermint Extract GL"
    },
    {
      unilever_product_number: "67669943",
      unilever_product_description: "GLB Plantain Extract GL"
    },
    {
      unilever_product_number: "67675198",
      unilever_product_description: "GLB Prickly Pear Extract GL"
    },
    {
      unilever_product_number: "67673987",
      unilever_product_description: "GLB Quinoa Extract GL"
    },
    {
      unilever_product_number: "67664154",
      unilever_product_description: "GLB Raspberry Extract GL"
    },
    {
      unilever_product_number: "67671242",
      unilever_product_description: "GLB Rose Extract GL"
    },
    {
      unilever_product_number: "67669952",
      unilever_product_description: "GLB Sage Extract GL"
    },
    {
      unilever_product_number: "67669957",
      unilever_product_description: "GLB Slippery Elm Bark Extract GL"
    },
    {
      unilever_product_number: "67673802",
      unilever_product_description: "GLB Spearmint Extract GL"
    },
    {
      unilever_product_number: "67669962",
      unilever_product_description: "GLB Tamarind Extract GL"
    },
    {
      unilever_product_number: "67670008",
      unilever_product_description: "GLB Vanilla Extract GL"
    },
    // duplicate unilever part number -> client ok with ignoring this product over the other product
    // {
    //   unilever_product_number: "67673739",
    //   unilever_product_description: "GLB Water Mint Extract GL"
    // },
    {
      unilever_product_number: "67673726",
      unilever_product_description: "GLB White Willow Bark Extract GL"
    },
    {
      unilever_product_number: "67673791",
      unilever_product_description: "GLB Yucca Extract GL"
    },
    {
      unilever_product_number: "67691705",
      unilever_product_description: "GLB Blue Agave Extract GL"
    },
    {
      unilever_product_number: "67673739",
      unilever_product_description: "GLB Wild Water Mint Extract GL (18kg pail)"
    },
    {
      unilever_product_number: "67959718",
      unilever_product_description: "GLB Hydros Witch Hazel PH"
    },
    {
      unilever_product_number: "67673000",
      unilever_product_description: "GLB Pomegranate Extract"
    },
    {
      unilever_product_number: "67870178",
      unilever_product_description: "Bamboo Charcoal Powder"
    },
    {
      unilever_product_number: "67673001",
      unilever_product_description: "Sodium Phytate (GreenGard PA-12)"
    },
    {
      unilever_product_number: "67672737",
      unilever_product_description: "SD PMT Benzoic Acid 25%+TEC+CapGlycol (GreenGard TBO)"
    },
    {
      unilever_product_number: "67673725",
      unilever_product_description: "Glyceryl Stearate Citrate"
    },
    {
      unilever_product_number: "67672741",
      unilever_product_description: "SD PMT GlycerylStearateCitrate+CetearylA (GreenWax G MB)"
    },
    {
      unilever_product_number: "11130422",
      unilever_product_description: "KahlWax 6421 MB"
    },

  ]

  const barcodeRef = useRef();
  const navigate = useNavigate();

  const [productFormValues, setProductFormValues] = useState(defaultProductFormValues);
  const [unileverFormValues, setUnileverFormValues] = useState(defaultUnileverFormValues);
  const [productModalShow, setProductModalShow] = useState(false);
  const [printModalShow, setPrintModalShow] = useState(false);
  const [printUnileverModal, setPrintUnileverModal] = useState(false);
  const [unileverModalShow, setUnileverModalShow] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [barcode, setBarcode] = useState("");

  const usStateAbbreviations = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  const filteredProducts = products.filter(item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase()));

  // modal functions
  const handleProductModalClose = () => {
    setEditing(false);
    setProductFormValues(defaultProductFormValues);
    setProductModalShow(false);
  };
  const handleModalShow = () => setProductModalShow(true);

  const handlePrintModalClose = () => {
    setPrintModalShow(false);
    setEditing(false);
  }

  const handleUnileverModalClose = () => {
    setUnileverFormValues(defaultUnileverFormValues);
    setUnileverModalShow(false);
  }
  const handlePrintUnileverModalClose = () => {
    setUnileverFormValues(defaultUnileverFormValues);
    setPrintUnileverModal(false);
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
      width: "25px",
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
            <FontAwesomeIcon icon={faBarcode} />
          </Button>
        );
      },
    },
    {
      text: "Unilever",
      className: "unilever-label",
      width: "130px",
      align: "left",
      sortable: false,
      cell: (record) => {
        return (
          <Button
            className={record.complete ? "custom-disabled-button" : ""}
            variant="outline-success"
            size="sm"
            disabled={record.complete}
            onClick={() => handleUnileverForm(record)}>
            <FontAwesomeIcon icon={faDolly} /> &nbsp; Unilever
          </Button>
        );
      },
    },
    {
      text: "Check Out",
      className: "check-out",
      width: "145px",
      align: "left",
      sortable: false,
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
      name: 'Checked Out?',
      selector: row => row.complete ? "yes" : "no",
      sortable: true,
      width: "100px",
      center: true,
      compact: true
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

  let unileverItemOptions = unileverPartNumbers.map(part => <option value={part.unilever_product_number} key={part.unilever_product_number}>{part.unilever_product_number}</option>)

  let usStateOptions = usStateAbbreviations.map(state => <option value={state} key={state}>{state}</option>)

  function handleProductInput(eventTarget) {
    setProductFormValues({ ...productFormValues, [eventTarget.name]: eventTarget.value })
  }

  function handleUnileverInput(eventTarget, nestedObject) {

    if (nestedObject === "address") {
      let previousAddressValues = unileverFormValues.unilever_address
      setUnileverFormValues({
        ...unileverFormValues,
        unilever_address: {
          ...previousAddressValues,
          [eventTarget.name]: eventTarget.value
        }
      })
    } if (nestedObject === "unilever-part") {
      let thisPart = unileverPartNumbers.filter(part => part.unilever_product_number === eventTarget.value)
      setUnileverFormValues({ ...unileverFormValues, [eventTarget.name]: eventTarget.value, description: thisPart[0].unilever_product_description })
    } else {
      setUnileverFormValues({ ...unileverFormValues, [eventTarget.name]: eventTarget.value })
    }
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
    setBarcode(record.sap_material_number + ", " + record.name + ", " + record.lot_number);
    setPrintModalShow(true)
  }

  function handleUnileverForm(record) {
    let weightPounds = record.weight * 2.2046
    let formattedDate = moment(record.expiration_date).format("MM/DD/YYYY")

    setUnileverFormValues({ ...unileverFormValues, product_name: record.name, product_lot_number: record.lot_number, net_weight: weightPounds, expiration_date: formattedDate })
    setUnileverModalShow(true)
  }

  function handleUnileverPrint() {
    setUnileverModalShow(false)
    setPrintUnileverModal(true)
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
        <Col className='col-7'>
          <h3>Product Records</h3>
        </Col>
        <Col className='col-3 pe-0 d-flex justify-content-end'>
          <Button className="import-excel-button" variant="primary" size="sm" onClick={() => navigate("/import")}>
            <FontAwesomeIcon icon={faFileImport} /> &nbsp; Import Products from Excel
          </Button>
        </Col>
        <Col className='col-2 d-flex justify-content-end'>
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
      <Modal show={productModalShow} onHide={handleProductModalClose}>
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

      {/* unilever label form modal */}
      <Modal show={unileverModalShow} onHide={handleUnileverModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Unilever Label</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className='m-3'>
            <Row>
              <Col className='col-8'>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control type="name" name="product_name" placeholder="Enter product name" disabled value={unileverFormValues.product_name} autoComplete="off" />
                </Form.Group>
              </Col>

              <Col className='col-4'>
                <Form.Group className="mb-3">
                  <Form.Label>Product Lot Number</Form.Label>
                  <Form.Control type="name" name="product_lot_number" placeholder="Enter product lot number" disabled value={unileverFormValues.product_lot_number} autoComplete="off" />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col className='col-6 d-flex flex-column justify-content-end'>
                <Form.Group className="mb-3">
                  <Form.Label>Unilever Item Number</Form.Label>
                  <Form.Select name="unilever_item_number" value={unileverFormValues.unilever_item_number} onChange={(e) => handleUnileverInput(e.target, "unilever-part")}>
                    {unileverItemOptions}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col className='col-3'>
                <Form.Group className="mb-3">
                  <Form.Label>Net Weight (lbs)</Form.Label>
                  <Form.Control type="number" step="any" name="net_weight" placeholder="Enter net weight in lbs" disabled value={unileverFormValues.net_weight} onChange={(e) => handleUnileverInput(e.target)} />
                </Form.Group>
              </Col>
              <Col className='col-3'>
                <Form.Group className="mb-3">
                  <Form.Label>Expiration</Form.Label>
                  <Form.Control type="name" name="expiration_date" disabled value={unileverFormValues.expiration_date} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col className='col-7'>
                <Form.Group className="mb-3">
                  <Form.Label>Product Description</Form.Label>
                  <Form.Control type="name" name="description" placeholder="Enter product description" value={unileverFormValues.description} onChange={(e) => handleUnileverInput(e.target)} autoComplete="off" />
                </Form.Group>
              </Col>
              <Col className='col-5'>
                <Form.Group className="mb-3">
                  <Form.Label>PO#</Form.Label>
                  <Form.Control type="number" step="1" name="po_box_number" placeholder="Enter PO Box number" value={unileverFormValues.po_box_number} onChange={(e) => handleUnileverInput(e.target)} />
                </Form.Group>
              </Col>
            </Row>


            <hr className='mt-4 mb-4' />

            <Row>
              <Form.Group className="mb-3">
                <Form.Label>Recipient</Form.Label>
                <Form.Control type="name" name="recipient" placeholder="Enter Unilever recipient" value={unileverFormValues.unilever_address.recipient} onChange={(e) => handleUnileverInput(e.target, "address")} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Street Address</Form.Label>
                <Form.Control type="name" name="street_address" placeholder="Enter street number and name" value={unileverFormValues.unilever_address.street_address} onChange={(e) => handleUnileverInput(e.target, "address")} />
              </Form.Group>
            </Row>
            <Row>
              <Col className='col-9'>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control type="name" name="city" placeholder="Enter street number and name" value={unileverFormValues.unilever_address.city} onChange={(e) => handleUnileverInput(e.target, "address")} />
                </Form.Group>
              </Col>

              <Col className='col-3'>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select name="state" value={unileverFormValues.unilever_address.state} onChange={(e) => handleUnileverInput(e.target, "address")}>
                    <option>Select</option>
                    {usStateOptions}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className='d-flex justify-content-end'>
              <Button variant="primary" type="button" onClick={(e) => handleUnileverPrint(unileverFormValues)}>Submit</Button>
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

      {/* unilever barcode print modal */}
      <Modal show={printUnileverModal} onHide={handlePrintUnileverModalClose} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Print Unilever Label</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <Row className='barcode-wrap p-3'>
              <div ref={barcodeRef} id="unilever-barcodes">
                <Row>
                  <Col className='col-7'>
                    <strong>{unileverFormValues.product_name}</strong>
                    <br />
                    <i className='text-decoration-underline'>{unileverFormValues.description}</i>
                  </Col>
                  <Col className='col-5 d-flex flex-column align-items-center'>
                    <span><strong>Unilever Item number: </strong> {unileverFormValues.unilever_item_number}</span>
                    <Barcode value={printUnileverModal ? unileverFormValues.unilever_item_number : ""} lineColor='#00000' background='#FFFFFF' textMargin={0} fontSize={15} height={70} />
                  </Col>
                </Row>

                <Row>
                  <Col className='col-7 d-flex flex-column align-items-center'>
                    <span><strong>LOT </strong> {unileverFormValues.product_lot_number}</span>
                    <Barcode value={printUnileverModal ? unileverFormValues.product_lot_number : ""} lineColor='#00000' background='#FFFFFF' textMargin={0} fontSize={15} height={50} />
                  </Col>
                  <Col className='col-5 d-flex flex-column align-items-center'>
                    <span>Expiration: {unileverFormValues.expiration_date}</span>
                    <Barcode value={printUnileverModal ? unileverFormValues.expiration_date : ""} lineColor='#00000' background='#FFFFFF' textMargin={0} fontSize={15} height={50} />
                  </Col>
                </Row>

                <Row>
                  <Col className='col-7'>
                    <div className='pb-4 pt-4'>
                      <p className='mb-1'>Attn: Receiving</p>
                      <p className='mb-1'>{unileverFormValues.unilever_address.recipient}</p>
                      <p className='mb-1'>{unileverFormValues.unilever_address.street_address}</p>
                      <p className='mb-1'>{unileverFormValues.unilever_address.city}, {unileverFormValues.unilever_address.state} {unileverFormValues.unilever_address.country}</p>
                    </div>
                    <div>
                      <p className='mb-1'>Net Weight: {unileverFormValues.net_weight} lbs</p>
                      <p>PO# {unileverFormValues.po_box_number}</p>
                    </div>
                  </Col>
                  <Col className='col-5 d-flex justify-content-center align-items-center'>
                    <img className="unilever-print-logo" src={unilever_logo} alt="unilever logo" />
                  </Col>
                </Row>
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