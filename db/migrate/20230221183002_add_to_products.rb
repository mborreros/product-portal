class AddToProducts < ActiveRecord::Migration[7.0]
  def change
    add_column :products, :complete, :boolean, :default => false
  end
end
