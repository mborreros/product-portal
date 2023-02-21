class CreateProducts < ActiveRecord::Migration[7.0]
  def change
    create_table :products do |t|
      t.string :name
      t.string :lot_number
      t.integer :weight
      t.timestamps
    end
  end
end
