class CreateProductsShelves < ActiveRecord::Migration[7.0]
  def change
    create_table :products_shelves do |t|
      t.integer :product_id
      t.integer :shelf_id
      t.timestamps
    end
  end
end
