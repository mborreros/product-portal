puts "Creating warehouse shelves"

Shelf.create!(name: "Receiving")

(1..49).each do |num| 
  Shelf.create!(name: num.to_s + "A")
  Shelf.create!(name: num.to_s + "B")
  Shelf.create!(name: num.to_s + "C")
  Shelf.create!(name: num.to_s + "D")
  Shelf.create!(name: num.to_s + "E")
end

puts "Finished creating warehouse shelves"

puts "Creating sample product records"

Product.create!(name: "sample_product_1", lot_number: "45FG7", weight: 18, shelf_id: 3, sap_material_number: "204419")
Product.create!(name: "sample_product_2", lot_number: "7UT90", weight: 6, shelf_id: 2, sap_material_number: "304219")
Product.create!(name: "sample_product_3", lot_number: "P21DF", weight: 1, shelf_id: 2, sap_material_number: "144419")
Product.create!(name: "sample_product_4", lot_number: "754RT", weight: 24, shelf_id: 1, sap_material_number: "274419")
Product.create!(name: "sample_product_5", lot_number: "LU45G", weight: 12, shelf_id: 3, sap_material_number: "154419")

puts "Finished creating sample product records"