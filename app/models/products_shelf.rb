class ProductsShelf < ApplicationRecord

  belongs_to :product
  belongs_to :shelf
  
end
