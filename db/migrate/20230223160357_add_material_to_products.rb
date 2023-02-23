class AddMaterialToProducts < ActiveRecord::Migration[7.0]
  def change
    add_column :products, :sap_material_number, :string
  end
end
