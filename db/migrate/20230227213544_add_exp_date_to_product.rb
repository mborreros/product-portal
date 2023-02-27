class AddExpDateToProduct < ActiveRecord::Migration[7.0]
  def change
    add_column :products, :expiration_date, :string
  end
end
