import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons'

import { useCallback } from 'react';

import { utils, writeFileXLSX } from 'xlsx';
import moment from 'moment';


function ExportExcel({ products }) {

  let productsArray = []
  let exportDate = moment().format("YYYY-MM-DD")

  products.map((product) => {
    let parsedProduct = {
      'Material': product.sap_material_number,
      'Material Description': product.name,
      'Vendor Batch': product.lot_number,
      'Unrestricted': product.weight,
      'Formatted Expiration Date': product.expiration_date,
      'Shelf ID': product.shelf.id,
      'Checked Out': product.complete
    }
    productsArray.push(parsedProduct)
  })

  const exportFile = useCallback(() => {
    const ws = utils.json_to_sheet(productsArray);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, `${exportDate}-material-manager-export.xlsx`);
  }, [productsArray]);

  return (
    <Button className="export-excel-button me-4" variant="primary" size="sm" onClick={() => exportFile()}>
      <FontAwesomeIcon icon={faFileArrowUp} /> &nbsp; Export to Excel
    </Button>
  )
}

export default ExportExcel;