import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from './navbar';
import ProductsTable from './products_table';

import { useState, useEffect } from 'react';

function App() {

  const [products, setProducts] = useState(null)
  const [shelves, setShelves] = useState(null)

  useEffect(() => {
    fetch("/api/products")
    .then(response => response.json())
    .then(fetchedProducts => setProducts(fetchedProducts))
    .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    fetch("/api/shelves")
    .then(response => response.json())
    .then(fetchedShelves => setShelves(fetchedShelves))
    .catch(error => console.log(error))
  }, [])

  // console.log(shelves)

  return (
    <div>
      <Navigation />
      <ProductsTable products={products} setProducts={setProducts} shelves={shelves} />
    </div>
  );
}

export default App;
