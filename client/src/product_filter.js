import { Row, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

function FilterComponent({ filterText, onFilter, onClear }) {
  return (
    <Row className='flex-nowrap'>
      <Form.Control className="filter-input" id="search" type="text" placeholder="Filter Products By Barcode" value={filterText} onChange={onFilter} autoComplete="off" />
      <Button type="button" onClick={onClear} size="sm" variant="light" className='clear-filter-button'><FontAwesomeIcon icon={faXmark} /></Button>
    </Row>
  )
};

export default FilterComponent;