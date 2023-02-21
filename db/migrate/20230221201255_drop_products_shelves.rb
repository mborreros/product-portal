class DropProductsShelves < ActiveRecord::Migration[7.0]
  def change
    drop_table :products_shelves
  end
end
