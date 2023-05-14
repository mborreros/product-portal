import { Container, Row, Col, Button, Modal, Breadcrumb } from 'react-bootstrap';
import { useState, useRef, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarcode } from '@fortawesome/free-solid-svg-icons'

function ViewShelves({ shelves, pageTitle }) {

  // handle page title
  useEffect(() => {
    document.title = pageTitle || "";
  }, [pageTitle]);

  const [printModalShow, setPrintModalShow] = useState(false);
  const [bulkPrintModalShow, setBulkPrintModalShow] = useState(false);
  const [shelfBarcode, setShelfBarcode] = useState({ barcodeValue: "" });
  const shelfPrintRef = useRef();
  const bulkShelfPrintRef = useRef();

  const handlePrintModalClose = () => {
    setPrintModalShow(false);
  }

  const handleBulkPrintModalClose = () => {
    setBulkPrintModalShow(false);
  }

  const handleShelfPrint = useReactToPrint({
    content: () => shelfPrintRef.current,
    pageStyle: () => "@page { size: 3.5in 1.125in }",
    onAfterPrint: () => handlePrintModalClose()
  })

  const handleBulkShelfPrint = useReactToPrint({
    content: () => bulkShelfPrintRef.current,
    pageStyle: () => "@page { size: 3.5in 1.125in }",
    onAfterPrint: () => handleBulkPrintModalClose()
  })

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
      width: "600px",
      compact: true
    },
    {
      name: 'on Shelf',
      selector: row => row.products.length + " products",
      sortable: true,
      wrap: true,
      compact: true,
      width: "600px"
    },
    {
      text: "Shelf Tag",
      className: "edit",
      width: "200px",
      align: "left",
      sortable: false,
      compact: true,
      cell: (record) => {
        return (
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => handleShelfTagPrint(record)}>
            <FontAwesomeIcon icon={faBarcode} />
          </Button>
        );
      },
    },
  ];

  const bulkShelfTags = shelves.map(shelf => {
    let stringId = shelf.id.toString() + ", " + shelf.name
    return (
      <div className='pt-2 d-flex justify-content-center' key={stringId}>
        <Barcode value={stringId} text={"Shelf " + shelf.name} lineColor='#00000' background='#FFFFFF' height={50} />
      </div>
    )
  })

  function handleShelfTagPrint(record) {
    let stringId = record.id.toString() + ", " + record.name
    setShelfBarcode({ shelfName: record.name, barcodeValue: stringId });
    setPrintModalShow(true)
  }

  return (
    <Container className='mt-4'>
      <Row>
        <Col className='col-10'>
          <h3>View Shelves</h3>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Products Records</Breadcrumb.Item>
            <Breadcrumb.Item active>View Shelves</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col className='col-2 align-items-end col d-flex flex-column justify-content-end'>
          <Button variant="outline-primary" size="sm" onClick={() => setBulkPrintModalShow(true)}>
            Bulk Print Shelf Tags
          </Button>
        </Col>
      </Row>
      <Row>
        <Col className='col-12'>
          <DataTable
            columns={columns}
            data={shelves}
            pagination
            paginationPerPage={25}
            paginationRowsPerPageOptions={[25, 50, 100]} />
        </Col>
      </Row>

      {/* barcode print modal */}
      <Modal show={printModalShow} onHide={handlePrintModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Print Shelf Tag</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>

            <div className="d-flex justify-content-center py-3">
              <Row className='barcode-wrap'>
                <div ref={shelfPrintRef} id="product-tags" className='col-12 d-flex flex-column align-items-center pt-2 w-100'>
                  <Barcode value={shelfBarcode.barcodeValue} text={"Shelf " + shelfBarcode.shelfName} lineColor='#00000' background='#FFFFFF' height={50} />
                </div>
              </Row>
            </div>

            <Row>
              <Col className='d-flex justify-content-center pt-4'>
                <Button onClick={handleShelfPrint}>Print</Button>
              </Col>
            </Row>
          </Container>
        </Modal.Body>

      </Modal>

      {/* bulk barcode print modal */}
      <Modal show={bulkPrintModalShow} onHide={handleBulkPrintModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bulk Print Shelf Tag</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <Row>
              <Col className='d-flex justify-content-end pb-4'>
                <Button onClick={handleBulkShelfPrint}>Print</Button>
              </Col>
            </Row>
            <div className="d-flex justify-content-center py-3">
              <Row className='barcode-wrap'>
                <div ref={bulkShelfPrintRef} id="product-tags" className='col-12 d-flex flex-column align-items-center pt-2 w-100'>
                  {bulkShelfTags}
                </div>
              </Row>
            </div>
          </Container>
        </Modal.Body>

      </Modal>

    </Container>
  )
}

export default ViewShelves;