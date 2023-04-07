puts "Creating warehouse shelves"

Shelf.create!(name: "Receiving")

(10..23).each do |num| 
  Shelf.create!(name: num.to_s + "A")
  Shelf.create!(name: num.to_s + "B")
  Shelf.create!(name: num.to_s + "C")
end

(24..27).each do |num| 
  Shelf.create!(name: num.to_s + "A")
  Shelf.create!(name: num.to_s + "B")
  Shelf.create!(name: num.to_s + "C")
  Shelf.create!(name: num.to_s + "D")
  Shelf.create!(name: num.to_s + "E")
end

(28..32).each do |num| 
  Shelf.create!(name: num.to_s + "A")
  Shelf.create!(name: num.to_s + "B")
  Shelf.create!(name: num.to_s + "C")
end

(33..34).each do |num| 
  Shelf.create!(name: num.to_s + "A")
  Shelf.create!(name: num.to_s + "B")
  Shelf.create!(name: num.to_s + "C")
  Shelf.create!(name: num.to_s + "D")
end

(35..43).each do |num| 
  Shelf.create!(name: num.to_s + "A")
  Shelf.create!(name: num.to_s + "B")
  Shelf.create!(name: num.to_s + "C")
end

Shelf.create!(name: "44A")
Shelf.create!(name: "44B")
Shelf.create!(name: "44C")
Shelf.create!(name: "44D")

Shelf.create!(name: "45A")
Shelf.create!(name: "45B")
Shelf.create!(name: "45C")

(46..48).each do |num| 
  Shelf.create!(name: num.to_s + "A")
  Shelf.create!(name: num.to_s + "B")
  Shelf.create!(name: num.to_s + "C")
  Shelf.create!(name: num.to_s + "D")
end


puts "Finished creating warehouse shelves"