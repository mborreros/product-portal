puts "Creating sample product records"
Product.create!(name: "apple", lot_number: "45FG7", weight: 18)
Product.create!(name: "banana", lot_number: "7UT90", weight: 6)
Product.create!(name: "clementine", lot_number: "P21DF", weight: 1)
Product.create!(name: "durian", lot_number: "754RT", weight: 24)
Product.create!(name: "elote", lot_number: "LU45G", weight: 12)
puts "Finished creating sample product records"

puts "Creating sample shelves"
Shelf.create!(name: "Shelf #1")
Shelf.create!(name: "Shelf #2")
Shelf.create!(name: "Shelf #3")
puts "Finished creating sample shelves"

puts "Creating sample products_shelves relationships"
ProductsShelf.create!(product_id: 1, shelf_id: 3)
ProductsShelf.create!(product_id: 2, shelf_id: 1)
ProductsShelf.create!(product_id: 3, shelf_id: 2)
ProductsShelf.create!(product_id: 4, shelf_id: 2)
ProductsShelf.create!(product_id: 5, shelf_id: 1)
puts "Finished creating sample products_shelves relationships"
