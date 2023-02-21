class AddShelfIdColumn < ActiveRecord::Migration[7.0]
  def change
    add_column :products, :shelf_id, :integer
  end
end
