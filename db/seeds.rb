puts "Creating sample shelves"
Shelf.create!(name: "Shelf #1")
Shelf.create!(name: "Shelf #2")
Shelf.create!(name: "Shelf #3")
puts "Finished creating sample shelves"

puts "Creating sample product records"
Product.create!(name: "apple", lot_number: "45FG7", weight: 18, shelf_id: 3, sap_material_number: "204419")
Product.create!(name: "banana", lot_number: "7UT90", weight: 6, shelf_id: 2, sap_material_number: "304219")
Product.create!(name: "clementine", lot_number: "P21DF", weight: 1, shelf_id: 2, sap_material_number: "144419")
Product.create!(name: "durian", lot_number: "754RT", weight: 24, shelf_id: 1, sap_material_number: "274419")
Product.create!(name: "elote", lot_number: "LU45G", weight: 12, shelf_id: 3, sap_material_number: "154419")
puts "Finished creating sample product records"