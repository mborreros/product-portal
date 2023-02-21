import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

function Navigation() {
  return(
    <Navbar bg="light">
        <Container>
          <Navbar.Brand>Product Portal</Navbar.Brand>
        </Container>
      </Navbar>
  )
}

export default Navigation;