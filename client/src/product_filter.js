import { Row, Button, Form } from 'react-bootstrap';

function FilterComponent({ filterText, onFilter, onClear }) {
  return (
    <Row className='flex-nowrap'>
      <Form.Control className="filter-input" id="search" type="text" placeholder="Filter Products By Barcode" value={filterText} onChange={onFilter} autoComplete="off" />
      <Button type="button" onClick={onClear} size="sm" variant="light" className='clear-filter-button'>&times;</Button>
    </Row>
  )
};

export default FilterComponent;