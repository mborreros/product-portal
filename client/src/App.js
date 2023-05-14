import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProductsTable from './products_table';
import ImportProducts from './import_product';
import AuditShelf from './audit_shelf';
import ViewShelves from './view_shelves';

import { useState, useEffect } from 'react';

function App() {

  const [products, setProducts] = useState([])
  const [shelves, setShelves] = useState([])

  useEffect(() => {
    fetch('/api/products')
      .then(response => response.json())
      .then(fetchedProducts => setProducts(fetchedProducts))
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    fetch('/api/shelves')
      .then(response => response.json())
      .then(fetchedShelves => setShelves(fetchedShelves))
      .catch(error => console.log(error))
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductsTable products={products} setProducts={setProducts} shelves={shelves} />} />
        <Route path="/import" element={<ImportProducts shelves={shelves} products={products} setProducts={setProducts} pageTitle={"Import Products | Material Manager"}/>} />
        <Route path="/audit" element={<AuditShelf shelves={shelves} products={products} setProducts={setProducts} pageTitle={"Audit Shelf | Material Manager"} />} />
        <Route path="/shelves" element={<ViewShelves shelves={shelves} pageTitle={"View Shelves | Material Manager"} />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
